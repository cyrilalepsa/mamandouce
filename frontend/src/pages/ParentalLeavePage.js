import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Scale, Baby, Calendar, Clock, Euro, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

function ParentalLeavePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              <h1 className="text-lg font-bold text-indigo-600">
                {t('parentalLeave.title', 'Congés parentaux')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('parentalLeave.subtitle', 'Vos droits en France - Mise à jour 2024')}
            </p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Alerte nouvelle loi */}
        <Card className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">
                {t('parentalLeave.newLaw', 'Nouvelle loi 2024')}
              </h3>
              <p className="text-xs opacity-90 mt-1">
                {t('parentalLeave.newLawDesc', 'Le congé paternité est passé de 11 à 25 jours (+3 jours naissance). Applicable depuis juillet 2021.')}
              </p>
            </div>
          </div>
        </Card>

        {/* Congé maternité */}
        <Card className="bg-white rounded-2xl p-4 mb-4 border border-pink-100">
          <button 
            onClick={() => toggleSection('maternity')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Baby className="w-5 h-5 text-pink-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-700">
                  {t('parentalLeave.maternityLeave', 'Congé maternité')}
                </h3>
                <p className="text-xs text-pink-500 font-medium">16 semaines minimum</p>
              </div>
            </div>
            {expandedSection === 'maternity' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          {expandedSection === 'maternity' && (
            <div className="mt-4 pt-4 border-t border-pink-100 space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-pink-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Durée</p>
                  <p className="text-xs text-slate-500">
                    • 1er ou 2ème enfant : <strong>16 semaines</strong> (6 avant + 10 après)
                    <br />• 3ème enfant ou + : <strong>26 semaines</strong> (8 avant + 18 après)
                    <br />• Jumeaux : <strong>34 semaines</strong>
                    <br />• Triplés ou + : <strong>46 semaines</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Euro className="w-4 h-4 text-pink-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Indemnisation</p>
                  <p className="text-xs text-slate-500">
                    Indemnités journalières versées par la Sécurité sociale = salaire journalier de base (plafonné à 100,36€/jour en 2024)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-pink-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Conditions</p>
                  <p className="text-xs text-slate-500">
                    Être salariée et avoir travaillé au moins 150h au cours des 3 mois précédents
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Congé paternité */}
        <Card className="bg-white rounded-2xl p-4 mb-4 border border-blue-100">
          <button 
            onClick={() => toggleSection('paternity')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Baby className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-700">
                  {t('parentalLeave.paternityLeave', 'Congé paternité')}
                </h3>
                <p className="text-xs text-blue-500 font-medium">28 jours (dont 7 obligatoires)</p>
              </div>
            </div>
            {expandedSection === 'paternity' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          {expandedSection === 'paternity' && (
            <div className="mt-4 pt-4 border-t border-blue-100 space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Durée totale : 28 jours</p>
                  <p className="text-xs text-slate-500">
                    • <strong>3 jours</strong> de congé naissance (obligatoires, à prendre immédiatement)
                    <br />• <strong>4 jours</strong> obligatoires après la naissance
                    <br />• <strong>21 jours</strong> facultatifs (fractionnables en 2 périodes)
                    <br />• Naissances multiples : <strong>+7 jours</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Délai</p>
                  <p className="text-xs text-slate-500">
                    Les 21 jours facultatifs doivent être pris dans les <strong>6 mois</strong> suivant la naissance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Euro className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Indemnisation</p>
                  <p className="text-xs text-slate-500">
                    Indemnités journalières de la Sécurité sociale (même calcul que le congé maternité)
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Congé parental d'éducation */}
        <Card className="bg-white rounded-2xl p-4 mb-4 border border-purple-100">
          <button 
            onClick={() => toggleSection('parental')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-700">
                  {t('parentalLeave.parentalEducation', 'Congé parental d\'éducation')}
                </h3>
                <p className="text-xs text-purple-500 font-medium">Jusqu'à 3 ans</p>
              </div>
            </div>
            {expandedSection === 'parental' ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
          
          {expandedSection === 'parental' && (
            <div className="mt-4 pt-4 border-t border-purple-100 space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Durée</p>
                  <p className="text-xs text-slate-500">
                    • Temps complet ou temps partiel (min. 16h/semaine)
                    <br />• 1er enfant : max 1 an
                    <br />• À partir du 2ème : jusqu'aux 3 ans de l'enfant
                    <br />• Renouvelable plusieurs fois
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Euro className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">PreParE (CAF)</p>
                  <p className="text-xs text-slate-500">
                    • Temps complet : ~428€/mois
                    <br />• Mi-temps : ~277€/mois
                    <br />• Temps partiel (50-80%) : ~160€/mois
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Conditions</p>
                  <p className="text-xs text-slate-500">
                    1 an d'ancienneté minimum dans l'entreprise à la date de naissance
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Points importants */}
        <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <h3 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t('parentalLeave.importantPoints', 'Points importants')}
          </h3>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Votre contrat de travail est suspendu mais pas rompu</li>
            <li>• Protection contre le licenciement pendant le congé</li>
            <li>• Vous retrouvez votre poste ou un poste équivalent au retour</li>
            <li>• Délai de prévenance : 1 mois avant la date de départ</li>
            <li>• Possibilité de cumuler différents congés</li>
          </ul>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
            <Scale className="w-4 h-4 text-indigo-300" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {t('parentalLeave.disclaimer', 'Informations à titre indicatif. Consultez service-public.fr pour les détails officiels.')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ParentalLeavePage;
