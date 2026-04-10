import { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Camera, Pencil, X, Check, Loader2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { AvatarBuilder, AvatarPreview } from './AvatarBuilder';

export function ProfileEditCard({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarConfig, setAvatarConfig] = useState(user?.avatar_config || null);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image est trop grande (max 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewAvatar(compressedBase64);
        setAvatar(compressedBase64);
        setAvatarConfig(null); // Réinitialiser la config si on utilise une vraie photo
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarBuilderSave = (config) => {
    setAvatarConfig(config);
    setAvatar(''); // Pas de photo, on utilise la config
    setPreviewAvatar('');
    setShowAvatarBuilder(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.auth.updateProfile({
        display_name: displayName.trim() || null,
        avatar: avatar || null,
        avatar_config: avatarConfig || null
      });

      if (response.data.success) {
        toast.success('Profil mis à jour !');
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(response.data.user);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.display_name || '');
    setAvatar(user?.avatar || '');
    setAvatarConfig(user?.avatar_config || null);
    setPreviewAvatar(user?.avatar || '');
    setIsEditing(false);
  };

  const removeAvatar = () => {
    setAvatar('');
    setAvatarConfig(null);
    setPreviewAvatar('');
  };

  const currentDisplayName = user?.display_name || user?.name || 'Utilisatrice';

  // Détermine comment afficher l'avatar
  const renderAvatar = (size = 80) => {
    if (previewAvatar) {
      return (
        <img 
          src={previewAvatar} 
          alt="Avatar" 
          className="w-full h-full object-cover"
          data-testid="user-avatar-image"
        />
      );
    }
    
    if (avatarConfig) {
      return <AvatarPreview config={avatarConfig} size={size} />;
    }
    
    // Avatar par défaut - silhouette femme
    return (
      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 text-white/90" fill="currentColor">
          <circle cx="12" cy="6" r="4" />
          <path d="M12 12c-4 0-6 2-6 4v1c0 .5.2 1 .6 1.3.5.4 1.2.7 2.4.7h6c1.2 0 1.9-.3 2.4-.7.4-.3.6-.8.6-1.3v-1c0-2-2-4-6-4z" />
          <path d="M9 19c-.3 1.5-.5 2.5-.5 3h7c0-.5-.2-1.5-.5-3H9z" />
        </svg>
      </div>
    );
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 border-0" data-testid="profile-edit-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Mon apparence
          </h3>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              data-testid="edit-profile-button"
              className="text-pink-500 hover:text-pink-600 hover:bg-pink-100"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-600"
                disabled={saving}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                data-testid="save-profile-button"
                className="bg-pink-500 hover:bg-pink-600 text-white"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div 
              className={`w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg ${
                isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
              }`}
              onClick={() => isEditing && setShowAvatarBuilder(true)}
            >
              {renderAvatar(80)}
            </div>
            
            {isEditing && (
              <>
                <button
                  onClick={() => setShowAvatarBuilder(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-pink-600 transition-colors"
                  data-testid="change-avatar-button"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {(previewAvatar || avatarConfig) && (
                  <button
                    onClick={removeAvatar}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
                    data-testid="remove-avatar-button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="avatar-file-input"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="avatar-camera-input"
            />
          </div>

          {/* Nom */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm text-slate-600">
                  Comment voulez-vous être appelée ?
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={user?.name || "Votre prénom"}
                  maxLength={50}
                  data-testid="display-name-input"
                  className="bg-white border-slate-200 rounded-xl"
                />
                <p className="text-xs text-slate-400">
                  Ce nom apparaîtra sur la page d'accueil
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500">Bonjour,</p>
                <p className="text-xl font-bold text-slate-700" style={{ fontFamily: "'Caveat', cursive" }}>
                  {currentDisplayName}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal Avatar Builder */}
      {showAvatarBuilder && (
        <AvatarBuilder
          currentConfig={avatarConfig}
          onSave={handleAvatarBuilderSave}
          onCancel={() => setShowAvatarBuilder(false)}
          onUseCamera={() => {
            setShowAvatarBuilder(false);
            cameraInputRef.current?.click();
          }}
          onUseGallery={() => {
            setShowAvatarBuilder(false);
            fileInputRef.current?.click();
          }}
        />
      )}
    </>
  );
}
