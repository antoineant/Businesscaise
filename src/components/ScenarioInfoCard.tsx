import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Briefcase } from 'lucide-react';

interface ScenarioInfoCardProps {
  archetype?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  } | null;
  industry?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  } | null;
  companyName?: string | null;
  productDescription?: string | null;
}

export const ScenarioInfoCard: React.FC<ScenarioInfoCardProps> = ({
  archetype,
  industry,
  companyName,
  productDescription,
}) => {
  const { t } = useTranslation('common');

  // Don't render if no scenario is set
  if (!archetype && !industry) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm p-6 border-2 border-indigo-200">
      <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
        <Briefcase className="w-5 h-5 mr-2" />
        {t('scenarioInfo.title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archetype && (
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{archetype.icon}</span>
              <div>
                <p className="text-sm text-gray-600">{t('scenarioInfo.companyType')}</p>
                <p className="font-semibold text-gray-900">{archetype.name}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{archetype.description}</p>
          </div>
        )}

        {industry && (
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{industry.icon}</span>
              <div>
                <p className="text-sm text-gray-600">{t('scenarioInfo.industry')}</p>
                <p className="font-semibold text-gray-900">{industry.name}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{industry.description}</p>
          </div>
        )}
      </div>

      {(companyName || productDescription) && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-100">
          <div className="flex items-start">
            <Building2 className="w-4 h-4 text-indigo-600 mt-1 mr-2 flex-shrink-0" />
            <div className="flex-1">
              {companyName && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600">{t('scenarioInfo.companyName')}</p>
                  <p className="font-medium text-gray-900">{companyName}</p>
                </div>
              )}
              {productDescription && (
                <div>
                  <p className="text-xs text-gray-600">{t('scenarioInfo.productService')}</p>
                  <p className="text-sm text-gray-700">{productDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
