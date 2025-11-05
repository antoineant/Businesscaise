import { DepartmentMetrics } from '../types/game';
import { getDepartmentDisplay, getMetricDisplay } from '../utils/gameEngine';

interface Props {
  metrics: DepartmentMetrics;
}

export default function DepartmentDashboard({ metrics }: Props) {
  const departments = ['marketing', 'sales', 'research', 'finance', 'hr'] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {departments.map((dept) => {
        const deptDisplay = getDepartmentDisplay(dept);
        const deptMetrics = metrics[dept];

        return (
          <div key={dept} className={`card ${deptDisplay.bgColor} border-l-4 ${deptDisplay.color}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{deptDisplay.icon}</span>
              <h3 className="text-xl font-bold text-gray-800">{deptDisplay.name}</h3>
            </div>

            <div className="space-y-3">
              {Object.entries(deptMetrics).map(([metric, value]) => {
                const metricDisplay = getMetricDisplay(dept, metric);
                const numValue = typeof value === 'number' ? value : 0;
                const isPercentage = metricDisplay.unit === '%';
                const maxValue = isPercentage ? 100 : (dept === 'sales' && metric === 'revenue') ? 1000 : 100;

                // Color coding based on value
                let valueColor = 'text-yellow-600';
                if (numValue >= maxValue * 0.7) valueColor = 'text-green-600';
                else if (numValue < maxValue * 0.4) valueColor = 'text-red-600';

                // Special case: debtRatio - lower is better
                if (metric === 'debtRatio') {
                  if (numValue <= 30) valueColor = 'text-green-600';
                  else if (numValue > 60) valueColor = 'text-red-600';
                }

                return (
                  <div key={metric} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{metricDisplay.label}</span>
                      <span className={`text-lg font-bold ${valueColor}`}>
                        {metric === 'revenue' || metric === 'cashFlow'
                          ? `$${numValue.toFixed(0)}K`
                          : `${numValue.toFixed(1)}${metricDisplay.unit}`}
                      </span>
                    </div>

                    {/* Progress bar for visual representation */}
                    {isPercentage && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            numValue >= 70 ? 'bg-green-500' :
                            numValue >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(numValue, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
