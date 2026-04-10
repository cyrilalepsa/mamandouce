"""
Memory Optimizer - Gestion optimisée de la mémoire pour Railway
Version 1.0 - Low Memory Profile

Objectif: Rester dans le crédit gratuit Railway (~512MB RAM)
"""
import gc
import os
import sys
import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import tempfile

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION LOW MEMORY PROFILE
# ============================================================================

class MemoryConfig:
    """Configuration mémoire optimisée pour Railway"""
    
    # Forcer le garbage collector à être agressif
    GC_THRESHOLD = (700, 10, 10)  # Seuils agressifs pour GC
    
    # Limite de fichiers temporaires (en MB)
    MAX_TEMP_SIZE_MB = 50
    
    # Intervalle de nettoyage (en secondes)
    CLEANUP_INTERVAL = 300  # 5 minutes
    
    # Activer le mode low memory
    LOW_MEMORY_MODE = os.environ.get('LOW_MEMORY_MODE', 'true').lower() == 'true'


class MemoryOptimizer:
    """Gestionnaire d'optimisation mémoire"""
    
    _instance: Optional['MemoryOptimizer'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self._cleanup_task: Optional[asyncio.Task] = None
        self._is_running = False
        self._stats = {
            "gc_runs": 0,
            "memory_freed_mb": 0.0,
            "temp_files_cleaned": 0,
            "last_cleanup": None
        }
        
        # Configurer le GC
        self._configure_gc()
        
        logger.info("[MemoryOptimizer] 🧹 Optimiseur mémoire initialisé")
        if MemoryConfig.LOW_MEMORY_MODE:
            logger.info("[MemoryOptimizer] ⚡ MODE LOW MEMORY ACTIVÉ")
    
    def _configure_gc(self):
        """Configurer le garbage collector pour être plus agressif"""
        gc.set_threshold(*MemoryConfig.GC_THRESHOLD)
        gc.enable()
        logger.info(f"[MemoryOptimizer] GC configuré: seuils={MemoryConfig.GC_THRESHOLD}")
    
    async def start(self):
        """Démarrer le nettoyage automatique"""
        if self._is_running:
            return
        
        self._is_running = True
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
        logger.info("[MemoryOptimizer] 🔄 Nettoyage automatique démarré")
    
    async def stop(self):
        """Arrêter le nettoyage automatique"""
        self._is_running = False
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
        logger.info("[MemoryOptimizer] 🛑 Nettoyage automatique arrêté")
    
    async def _cleanup_loop(self):
        """Boucle de nettoyage périodique"""
        while self._is_running:
            try:
                await self.run_cleanup()
            except Exception as e:
                logger.error(f"[MemoryOptimizer] Erreur nettoyage: {e}")
            
            await asyncio.sleep(MemoryConfig.CLEANUP_INTERVAL)
    
    async def run_cleanup(self):
        """Exécuter un cycle complet de nettoyage"""
        logger.info("[MemoryOptimizer] 🧹 Nettoyage mémoire en cours...")
        
        # 1. Forcer le garbage collection
        freed = self._force_gc()
        
        # 2. Nettoyer les fichiers temporaires
        temp_cleaned = await self._clean_temp_files()
        
        # 3. Mettre à jour les stats
        self._stats["gc_runs"] += 1
        self._stats["temp_files_cleaned"] += temp_cleaned
        self._stats["last_cleanup"] = datetime.now(timezone.utc).isoformat()
        
        logger.info(f"[MemoryOptimizer] ✅ Nettoyage terminé - GC: {freed} objets, Temp: {temp_cleaned} fichiers")
        
        return freed, temp_cleaned
    
    def _force_gc(self) -> int:
        """Forcer le garbage collector et retourner le nombre d'objets collectés"""
        # Collecter les 3 générations
        collected = 0
        for gen in range(3):
            collected += gc.collect(gen)
        
        return collected
    
    async def _clean_temp_files(self) -> int:
        """Nettoyer les fichiers temporaires anciens"""
        cleaned = 0
        temp_dir = Path(tempfile.gettempdir())
        
        try:
            # Calculer la taille totale actuelle
            total_size = 0
            old_files = []
            
            for item in temp_dir.iterdir():
                try:
                    if item.is_file():
                        stat = item.stat()
                        total_size += stat.st_size
                        # Fichiers de plus de 30 minutes
                        age_seconds = (datetime.now().timestamp() - stat.st_mtime)
                        if age_seconds > 1800:  # 30 minutes
                            old_files.append(item)
                except (PermissionError, FileNotFoundError):
                    continue
            
            total_size_mb = total_size / (1024 * 1024)
            
            # Nettoyer si on dépasse la limite ou si les fichiers sont vieux
            if total_size_mb > MemoryConfig.MAX_TEMP_SIZE_MB or old_files:
                for file_path in old_files:
                    try:
                        # Ne supprimer que les fichiers liés à notre app
                        if any(pattern in file_path.name for pattern in ['upload', 'scan', 'mamandouce', 'tmp']):
                            file_path.unlink()
                            cleaned += 1
                    except (PermissionError, FileNotFoundError):
                        continue
                
                if cleaned > 0:
                    logger.info(f"[MemoryOptimizer] 🗑️ {cleaned} fichiers temp supprimés")
        
        except Exception as e:
            logger.error(f"[MemoryOptimizer] Erreur nettoyage temp: {e}")
        
        return cleaned
    
    def get_memory_stats(self) -> dict:
        """Obtenir les statistiques mémoire actuelles"""
        import resource
        
        try:
            # Mémoire du processus actuel
            usage = resource.getrusage(resource.RUSAGE_SELF)
            mem_mb = usage.ru_maxrss / 1024  # Convertir KB en MB (Linux)
        except:
            mem_mb = 0
        
        gc_stats = gc.get_stats()
        
        return {
            "memory_mb": round(mem_mb, 2),
            "gc_stats": {
                f"gen{i}": {
                    "collections": s.get("collections", 0),
                    "collected": s.get("collected", 0),
                    "uncollectable": s.get("uncollectable", 0)
                } for i, s in enumerate(gc_stats)
            },
            "optimizer_stats": self._stats.copy(),
            "low_memory_mode": MemoryConfig.LOW_MEMORY_MODE
        }
    
    def cleanup_after_request(self):
        """Nettoyage léger après chaque requête (appeler dans les routes lourdes)"""
        if MemoryConfig.LOW_MEMORY_MODE:
            gc.collect(0)  # Collecter uniquement la génération 0 (rapide)


# ============================================================================
# DÉCORATEUR POUR ROUTES AVEC NETTOYAGE AUTO
# ============================================================================

def with_memory_cleanup(func):
    """Décorateur pour nettoyer la mémoire après une route lourde"""
    async def wrapper(*args, **kwargs):
        try:
            result = await func(*args, **kwargs)
            return result
        finally:
            # Nettoyage léger après l'exécution
            memory_optimizer.cleanup_after_request()
    
    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper


# ============================================================================
# CONTEXT MANAGER POUR OPÉRATIONS LOURDES
# ============================================================================

class HeavyOperation:
    """Context manager pour les opérations consommant beaucoup de mémoire"""
    
    def __init__(self, operation_name: str = "unknown"):
        self.operation_name = operation_name
    
    async def __aenter__(self):
        if MemoryConfig.LOW_MEMORY_MODE:
            # Forcer un GC avant une opération lourde
            gc.collect()
        logger.debug(f"[MemoryOptimizer] ▶️ Début opération: {self.operation_name}")
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if MemoryConfig.LOW_MEMORY_MODE:
            # Forcer un GC complet après une opération lourde
            gc.collect(2)
        logger.debug(f"[MemoryOptimizer] ⏹️ Fin opération: {self.operation_name}")
        return False


# Instance globale
memory_optimizer = MemoryOptimizer()
