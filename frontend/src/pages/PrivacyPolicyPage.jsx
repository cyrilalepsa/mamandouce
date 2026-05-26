import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Politique de Confidentialité</h1>
        </div>

        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-slate-500 mb-6">Dernière mise à jour : Mars 2026</p>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">1. Introduction</h2>
            <p className="text-slate-600 mb-4">
              MamanDouce ("nous", "notre", "l'application") s'engage à protéger la vie privée de ses utilisateurs. 
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.
            </p>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">2. Données collectées</h2>
            <p className="text-slate-600 mb-2">Nous collectons les informations suivantes :</p>
            <ul className="list-disc pl-6 text-slate-600 mb-4">
              <li>Adresse email (pour la création de compte)</li>
              <li>Informations de grossesse (date des dernières règles, date prévue d'accouchement)</li>
              <li>Historique de recherche d'aliments</li>
              <li>Notes médicales que vous saisissez volontairement</li>
              <li>Préférences de notification</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">3. Utilisation des données</h2>
            <p className="text-slate-600 mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 text-slate-600 mb-4">
              <li>Personnaliser votre expérience dans l'application</li>
              <li>Calculer vos dates de grossesse</li>
              <li>Vous fournir des conseils adaptés à votre semaine de grossesse</li>
              <li>Vous envoyer des notifications si vous les avez activées</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">4. Partage des données</h2>
            <p className="text-slate-600 mb-4">
              Nous ne vendons, n'échangeons ni ne transférons vos informations personnelles à des tiers, 
              sauf pour les services techniques nécessaires au fonctionnement de l'application 
              (hébergement, paiement sécurisé via Stripe).
            </p>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">5. Sécurité des données</h2>
            <p className="text-slate-600 mb-4">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles 
              contre tout accès non autorisé, modification, divulgation ou destruction.
            </p>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">6. Vos droits (RGPD)</h2>
            <p className="text-slate-600 mb-2">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 text-slate-600 mb-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">7. Conservation des données</h2>
            <p className="text-slate-600 mb-4">
              Vos données sont conservées tant que votre compte est actif. 
              Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment.
            </p>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">8. Cookies</h2>
            <p className="text-slate-600 mb-4">
              L'application utilise des cookies techniques nécessaires à son fonctionnement (authentification). 
              Aucun cookie publicitaire n'est utilisé.
            </p>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">9. Contact</h2>
            <p className="text-slate-600 mb-4">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
              veuillez nous contacter à : <a href="mailto:contact@mamandouce.app" className="text-sky-500">contact@mamandouce.app</a>
            </p>

            <h2 className="text-xl font-bold text-slate-700 mt-6 mb-3">10. Modifications</h2>
            <p className="text-slate-600 mb-4">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Les modifications seront publiées sur cette page avec une date de mise à jour.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
