import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Smartphone, 
  Download, 
  Mail, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileArchive,
  BookOpen,
  AlertTriangle,
  FileText,
  Briefcase,
  CreditCard
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function AndroidExportTab() {
  const [loading, setLoading] = useState(true);
  const [projectInfo, setProjectInfo] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  
  // Business Kit state
  const [businessKitInfo, setBusinessKitInfo] = useState(null);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [sendingBusinessKit, setSendingBusinessKit] = useState(false);
  
  // Instructions dropdown state
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadProjectInfo();
    loadBusinessKitInfo();
  }, []);

  const loadProjectInfo = async () => {
    try {
      const response = await api.admin.getAndroidInfo();
      setProjectInfo(response.data);
    } catch (error) {
      console.error('Erreur chargement info Android:', error);
      toast.error('Erreur lors du chargement des informations');
    } finally {
      setLoading(false);
    }
  };
  
  const loadBusinessKitInfo = async () => {
    try {
      const response = await api.admin.getBusinessKitInfo();
      setBusinessKitInfo(response.data);
    } catch (error) {
      console.error('Erreur chargement business kit:', error);
    }
  };

  const handleDownload = async () => {
    setExporting(true);
    setExportType('download');
    setShowExportMenu(false);
    
    try {
      // Create a link to trigger download
      const token = localStorage.getItem('token');
      const downloadUrl = `${process.env.REACT_APP_BACKEND_URL}/api/admin/android/download`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mamandouce-android-${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Téléchargement démarré !');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  const handleSendEmail = async () => {
    setExporting(true);
    setExportType('email');
    setShowExportMenu(false);
    
    try {
      const response = await api.admin.sendAndroidEmail();
      toast.success(response.data.message);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      const message = error.response?.data?.detail || 'Erreur lors de l\'envoi';
      toast.error(message);
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };
  
  const handleSendBusinessKit = async () => {
    setSendingBusinessKit(true);
    setShowBusinessMenu(false);
    
    try {
      const response = await api.admin.sendBusinessKitEmail();
      toast.success(response.data.message);
    } catch (error) {
      console.error('Erreur envoi business kit:', error);
      const message = error.response?.data?.detail || 'Erreur lors de l\'envoi';
      toast.error(message);
    } finally {
      setSendingBusinessKit(false);
    }
  };
  
  const handleViewBusinessDoc = (filename) => {
    // Les fichiers sont dans /public/docs, accessibles directement depuis le frontend
    window.open(`/docs/${filename}`, '_blank');
    setShowBusinessMenu(false);
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-3xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-500" />
        <p className="mt-4 text-slate-500">Chargement...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Export Android</h2>
            <p className="text-white/80">Téléchargez le projet pour Android Studio</p>
          </div>
        </div>
      </Card>

      {/* Status Card */}
      <Card className="bg-white rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          Statut du projet
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            {projectInfo?.android_ready ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <p className="font-semibold text-slate-700">Projet Android</p>
              <p className="text-sm text-slate-500">
                {projectInfo?.android_ready ? 'Prêt' : 'Non configuré'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            {projectInfo?.capacitor_configured ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <p className="font-semibold text-slate-700">Capacitor</p>
              <p className="text-sm text-slate-500">
                {projectInfo?.capacitor_configured ? 'Configuré' : 'Non configuré'}
              </p>
            </div>
          </div>
        </div>
        
        {projectInfo?.last_modified && (
          <p className="text-sm text-slate-500 mt-4">
            Dernière modification : {new Date(projectInfo.last_modified).toLocaleDateString('fr-FR')}
          </p>
        )}
      </Card>

      {/* Export Actions */}
      <Card className="bg-white rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <FileArchive className="w-5 h-5 text-purple-500" />
          Exporter le projet
        </h3>
        
        <div className="relative">
          <Button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting || !projectInfo?.android_ready}
            data-testid="export-android-btn"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl py-4 hover:opacity-90 flex items-center justify-center gap-3"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {exportType === 'download' ? 'Préparation du téléchargement...' : 'Envoi en cours...'}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Exporter le projet Android
                <ChevronDown className={`w-5 h-5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>
          
          {showExportMenu && !exporting && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
              <button
                onClick={handleDownload}
                disabled={!projectInfo?.download_available}
                className="w-full px-4 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">Télécharger le ZIP</p>
                  <p className="text-sm text-slate-500">Projet complet avec code source</p>
                </div>
              </button>
              
              <button
                onClick={handleSendEmail}
                disabled={!projectInfo?.email_available}
                className="w-full px-4 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors border-t border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">Envoyer par email</p>
                  <p className="text-sm text-slate-500">Recevoir le projet par email</p>
                </div>
              </button>
            </div>
          )}
        </div>
        
        {!projectInfo?.android_ready && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700">Projet non prêt</p>
              <p className="text-sm text-amber-600">
                Le projet Android n'est pas encore configuré. Contactez le support.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Instructions Card - Collapsible */}
      <Card className="bg-white rounded-3xl p-6">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-500" />
            Instructions de build
          </h3>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
        </button>
        
        {showInstructions && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Installer Node.js</p>
                <p className="text-sm text-slate-500">Téléchargez la version LTS sur nodejs.org</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Installer les dépendances</p>
                <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded mt-1">
                  npm install --legacy-peer-deps
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Compiler l'application</p>
                <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded mt-1">
                  npm run build
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">4</span>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Synchroniser avec Android</p>
                <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded mt-1">
                  npx cap sync android
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">5</span>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Générer le fichier AAB</p>
                <p className="text-sm text-slate-500">
                  Dans Android Studio : Build → Generate Signed Bundle / APK...
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-700">
                <strong>Important :</strong> Conservez précieusement votre fichier keystore (.jks) et son mot de passe.
                Sans eux, vous ne pourrez plus mettre à jour votre application sur le Play Store.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Business Kit Card */}
      <Card className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Kit Business</h2>
            <p className="text-white/80 text-sm">Plan financier, pitchs & carte de visite</p>
          </div>
        </div>
        
        <div className="relative">
          <Button
            onClick={() => setShowBusinessMenu(!showBusinessMenu)}
            disabled={sendingBusinessKit}
            data-testid="business-kit-btn"
            className="w-full bg-white text-amber-600 rounded-xl py-3 hover:bg-white/90 flex items-center justify-center gap-3 font-semibold"
          >
            {sendingBusinessKit ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Accéder au kit business
                <ChevronDown className={`w-5 h-5 transition-transform ${showBusinessMenu ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>
          
          {showBusinessMenu && !sendingBusinessKit && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
              <button
                onClick={() => handleViewBusinessDoc('BUSINESS_PLAN_MAMANDOUCE.md')}
                className="w-full px-4 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">Plan Business</p>
                  <p className="text-sm text-slate-500">Financier, pitchs, App Store...</p>
                </div>
              </button>
              
              <button
                onClick={() => handleViewBusinessDoc('CARTE_VISITE_MAMANDOUCE.html')}
                className="w-full px-4 py-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors border-t border-slate-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">Carte de visite</p>
                  <p className="text-sm text-slate-500">Modèle prêt à imprimer</p>
                </div>
              </button>
              
              <button
                onClick={handleSendBusinessKit}
                disabled={!businessKitInfo?.email_available}
                className="w-full px-4 py-4 text-left hover:bg-amber-50 flex items-center gap-4 transition-colors border-t border-slate-100 disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">Envoyer par email</p>
                  <p className="text-sm text-slate-500">Recevoir le kit complet</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
