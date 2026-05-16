/**
 * useDragAndDrop.js
 * Hook personnalisé pour gérer le drag & drop des éléments
 * Extrait de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook pour gérer le drag & drop des items et groupes
 * @param {Object} options - Options de configuration
 * @param {Object} options.currentPage - Page actuelle
 * @param {Function} options.createGroupFromItems - Fonction pour créer un groupe
 * @param {Function} options.addItemToGroup - Fonction pour ajouter un item à un groupe
 * @param {Function} options.removeItemFromGroup - Fonction pour retirer un item d'un groupe
 * @param {Function} options.changeGroupColor - Fonction pour changer la couleur d'un groupe
 * @param {Function} options.renameGroup - Fonction pour renommer un groupe
 * @param {Function} options.deleteGroup - Fonction pour supprimer un groupe
 * @param {Function} options.t - Fonction de traduction
 * @returns {Object} - États et handlers pour le drag & drop
 */
export function useDragAndDrop({
  currentPage,
  createGroupFromItems,
  addItemToGroup,
  removeItemFromGroup,
  changeGroupColor,
  renameGroup,
  deleteGroup,
  t
}) {
  // États pour le drag & drop
  const [draggingItem, setDraggingItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);
  const [selectedForGroup, setSelectedForGroup] = useState(null);
  
  // États pour le popup de création de groupe
  const [showGroupNamePopup, setShowGroupNamePopup] = useState(false);
  const [pendingGroupItems, setPendingGroupItems] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#fde68a'); // Jaune par défaut

  // Quand on commence à glisser un item
  const handleDragStart = useCallback((item) => {
    setDraggingItem(item);
  }, []);

  // Quand on arrête de glisser
  const handleDragEnd = useCallback(() => {
    setDraggingItem(null);
    setDropTarget(null);
  }, []);

  // Quand on dépose un item sur un autre item (créer groupe)
  const handleDropOnItem = useCallback(async (draggedItemId, targetItemId) => {
    if (!currentPage || currentPage.isDefault) return;
    
    // Stocker les items et afficher le popup de nom
    setPendingGroupItems({ draggedItemId, targetItemId });
    setNewGroupName(''); // Champ vide par défaut
    setNewGroupColor('#fde68a'); // Couleur jaune par défaut
    setShowGroupNamePopup(true);
    handleDragEnd();
  }, [currentPage, handleDragEnd]);

  // Confirmer la création du groupe
  const handleConfirmGroupCreation = useCallback(async () => {
    if (!pendingGroupItems) return;
    
    const { draggedItemId, targetItemId } = pendingGroupItems;
    // Nom vide = groupe sans nom (peut être affiché juste avec les icônes)
    const groupName = newGroupName.trim() || '';
    
    if (createGroupFromItems) {
      await createGroupFromItems(currentPage.id, draggedItemId, targetItemId, groupName, newGroupColor);
    }
    
    setShowGroupNamePopup(false);
    setPendingGroupItems(null);
    setNewGroupName('');
    setNewGroupColor('#fde68a');
  }, [pendingGroupItems, newGroupName, newGroupColor, createGroupFromItems, currentPage]);

  // Annuler la création du groupe
  const handleCancelGroupCreation = useCallback(() => {
    setShowGroupNamePopup(false);
    setPendingGroupItems(null);
    setNewGroupName('');
    setNewGroupColor('#fde68a');
  }, []);

  // Quand on dépose un item sur un groupe existant
  const handleDropOnGroup = useCallback(async (draggedItemId, groupId) => {
    if (!currentPage || currentPage.isDefault) return;
    
    if (addItemToGroup) {
      await addItemToGroup(currentPage.id, groupId, draggedItemId);
      toast.success(t('home.addedToGroup', 'Ajouté au groupe !'));
    }
    handleDragEnd();
  }, [currentPage, addItemToGroup, t, handleDragEnd]);

  // Ouvrir un groupe
  const handleOpenGroup = useCallback((group) => {
    setOpenGroup(group);
  }, []);

  // Fermer le popup de groupe
  const handleCloseGroup = useCallback(() => {
    setOpenGroup(null);
  }, []);

  // Retirer un item d'un groupe
  const handleRemoveFromGroup = useCallback(async (itemId) => {
    if (!currentPage || !openGroup) return;
    
    if (removeItemFromGroup) {
      await removeItemFromGroup(currentPage.id, openGroup.id, itemId);
      // Mettre à jour le groupe ouvert
      const updatedGroup = currentPage.groups?.find(g => g.id === openGroup.id);
      if (updatedGroup && updatedGroup.items.length > 0) {
        setOpenGroup(updatedGroup);
      } else {
        setOpenGroup(null);
      }
    }
  }, [currentPage, openGroup, removeItemFromGroup]);

  // Renommer un groupe
  const handleRenameGroup = useCallback(async (groupId, newName) => {
    if (!currentPage) return;
    if (renameGroup) {
      await renameGroup(currentPage.id, groupId, newName);
    }
  }, [currentPage, renameGroup]);

  // Supprimer un groupe
  const handleDeleteGroup = useCallback(async (groupId) => {
    if (!currentPage) return;
    if (deleteGroup) {
      await deleteGroup(currentPage.id, groupId);
    }
  }, [currentPage, deleteGroup]);

  // Changer la couleur d'un groupe
  const handleChangeGroupColor = useCallback(async (groupId, newColor) => {
    if (!currentPage) return;
    if (changeGroupColor) {
      await changeGroupColor(currentPage.id, groupId, newColor);
      // Mettre à jour le groupe ouvert si c'est celui qu'on modifie
      if (openGroup && openGroup.id === groupId) {
        setOpenGroup({ ...openGroup, color: newColor });
      }
    }
  }, [currentPage, changeGroupColor, openGroup]);

  return {
    // États
    draggingItem,
    dropTarget,
    openGroup,
    selectedForGroup,
    showGroupNamePopup,
    newGroupName,
    newGroupColor,
    
    // Setters
    setSelectedForGroup,
    setNewGroupName,
    setNewGroupColor,
    
    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDropOnItem,
    handleDropOnGroup,
    handleConfirmGroupCreation,
    handleCancelGroupCreation,
    handleOpenGroup,
    handleCloseGroup,
    handleRemoveFromGroup,
    handleRenameGroup,
    handleDeleteGroup,
    handleChangeGroupColor
  };
}

export default useDragAndDrop;
