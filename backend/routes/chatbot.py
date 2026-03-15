"""
AI Chatbot for pregnancy-related questions
Uses OpenAI GPT-4o-mini via Emergent integrations
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List, Optional
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

from core.database import db
from core.security import get_current_user
from models.schemas import User

router = APIRouter(tags=["chatbot"])

# System prompt for the pregnancy assistant
SYSTEM_PROMPT = """Tu es "MamanDouce AI", une assistante virtuelle bienveillante et experte en grossesse. 
Tu réponds UNIQUEMENT en français avec un ton chaleureux et rassurant.

Ton rôle est d'aider les futures mamans avec:
- Questions sur l'alimentation pendant la grossesse (aliments autorisés/interdits)
- Symptômes courants de la grossesse et conseils
- Démarches administratives (déclaration de grossesse, congé maternité, CAF, etc.)
- Préparation à l'accouchement et à l'arrivée de bébé
- Bien-être et exercices adaptés

RÈGLES IMPORTANTES:
1. Tu n'es PAS médecin. Pour tout symptôme inquiétant, conseille de consulter un professionnel de santé.
2. Sois empathique et encourageante. La grossesse peut être stressante.
3. Donne des réponses claires et structurées avec des listes si nécessaire.
4. Utilise des emojis avec modération pour rendre les réponses chaleureuses (💕, 🤰, 👶, ✨).
5. Si tu ne sais pas, dis-le honnêtement plutôt que d'inventer.
6. Réponds de manière concise (max 300 mots sauf si plus de détails sont demandés).

Tu es là pour accompagner, rassurer et informer, pas pour remplacer un suivi médical."""

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

@router.post("/chatbot/message", response_model=ChatResponse)
async def send_chat_message(chat: ChatMessage, current_user: User = Depends(get_current_user)):
    """Send a message to the AI chatbot and get a response"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Get or create session ID
    session_id = chat.session_id or str(uuid.uuid4())
    
    # Get API key
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Service IA non configuré")
    
    try:
        # Load chat history for context
        history = await db.chat_history.find(
            {"user_id": current_user.id, "session_id": session_id}
        ).sort("created_at", 1).to_list(20)  # Last 20 messages for context
        
        # Build conversation history
        messages_context = ""
        for msg in history[-10:]:  # Use last 10 for context window
            role = "Utilisatrice" if msg["role"] == "user" else "MamanDouce AI"
            messages_context += f"{role}: {msg['content']}\n"
        
        # Create system message with context
        system_with_context = SYSTEM_PROMPT
        if messages_context:
            system_with_context += f"\n\nHistorique de conversation récent:\n{messages_context}"
        
        # Initialize chat
        llm_chat = LlmChat(
            api_key=api_key,
            session_id=f"{current_user.id}_{session_id}",
            system_message=system_with_context
        ).with_model("openai", "gpt-4o-mini")
        
        # Send message
        user_message = UserMessage(text=chat.message)
        response = await llm_chat.send_message(user_message)
        
        # Save user message to history
        await db.chat_history.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "session_id": session_id,
            "role": "user",
            "content": chat.message,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Save assistant response to history
        await db.chat_history.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "session_id": session_id,
            "role": "assistant",
            "content": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du chatbot: {str(e)}")

@router.get("/chatbot/history")
async def get_chat_history(session_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    """Get chat history for a session or list all sessions"""
    if session_id:
        # Get messages for specific session
        messages = await db.chat_history.find(
            {"user_id": current_user.id, "session_id": session_id},
            {"_id": 0}
        ).sort("created_at", 1).to_list(100)
        return {"messages": messages, "session_id": session_id}
    else:
        # Get all sessions with last message
        pipeline = [
            {"$match": {"user_id": current_user.id}},
            {"$sort": {"created_at": -1}},
            {"$group": {
                "_id": "$session_id",
                "last_message": {"$first": "$content"},
                "last_role": {"$first": "$role"},
                "updated_at": {"$first": "$created_at"},
                "message_count": {"$sum": 1}
            }},
            {"$sort": {"updated_at": -1}},
            {"$limit": 20}
        ]
        sessions = await db.chat_history.aggregate(pipeline).to_list(20)
        return {"sessions": [
            {
                "session_id": s["_id"],
                "last_message": s["last_message"][:100] + "..." if len(s["last_message"]) > 100 else s["last_message"],
                "updated_at": s["updated_at"],
                "message_count": s["message_count"]
            }
            for s in sessions
        ]}

@router.delete("/chatbot/session/{session_id}")
async def delete_chat_session(session_id: str, current_user: User = Depends(get_current_user)):
    """Delete a chat session"""
    result = await db.chat_history.delete_many({
        "user_id": current_user.id,
        "session_id": session_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    
    return {"success": True, "message": "Conversation supprimée"}

# Quick questions suggestions
SUGGESTED_QUESTIONS = [
    "Quels aliments dois-je éviter pendant ma grossesse ?",
    "Comment soulager les nausées du premier trimestre ?",
    "Quelles démarches administratives dois-je faire ?",
    "Comment préparer ma valise de maternité ?",
    "Quand dois-je m'inscrire à la maternité ?",
    "Quels exercices puis-je faire enceinte ?",
]

@router.get("/chatbot/suggestions")
async def get_suggestions():
    """Get suggested questions for the chatbot"""
    return {"suggestions": SUGGESTED_QUESTIONS}
