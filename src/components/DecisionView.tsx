import { useState } from 'react';
import { MajorDecision, SubDecision, Team, DepartmentImpact } from '../types/game';
import { hasSubmitted, getSubmission, getDepartmentDisplay } from '../utils/gameEngine';
import FileUpload from './FileUpload';

interface Props {
  decision: MajorDecision;
  team: Team;
  onSubmit: (subDecisionId: string, value: any, fileData?: any) => void;
}

export default function DecisionView({ decision, team, onSubmit }: Props) {
  const [selectedSubDecision, setSelectedSubDecision] = useState<string | null>(null);

  const renderSubDecision = (subDecision: SubDecision) => {
    const submitted = hasSubmitted(team, subDecision.id);
    const submission = getSubmission(team, subDecision.id);

    return (
      <div key={subDecision.id} className="card border-l-4 border-primary-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-800 mb-2">{subDecision.title}</h4>
            <p className="text-gray-600 mb-4">{subDecision.description}</p>
          </div>
          {submitted && (
            <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              ✓ Submitted
            </span>
          )}
        </div>

        {subDecision.type === 'numeric' && (
          <NumericInput
            subDecision={subDecision}
            submitted={submitted}
            submission={submission}
            onSubmit={(value: number) => onSubmit(subDecision.id, value)}
          />
        )}

        {subDecision.type === 'file-upload' && (
          <FileUploadInput
            subDecision={subDecision}
            submitted={submitted}
            submission={submission}
            onSubmit={(fileData: any) => onSubmit(subDecision.id, null, fileData)}
          />
        )}

        {subDecision.type === 'multiple-choice' && (
          <MultipleChoiceInput
            subDecision={subDecision}
            submitted={submitted}
            submission={submission}
            onSubmit={(value: string) => onSubmit(subDecision.id, value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Decision Header */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-semibold mb-2">Week {decision.week}</div>
            <h2 className="text-3xl font-bold mb-3">{decision.title}</h2>
            <p className="text-primary-100 mb-4">{decision.description}</p>
          </div>
        </div>

        {/* Context Box */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2">📋 Context</h3>
          <p className="text-sm leading-relaxed">{decision.context}</p>
        </div>

        {/* Deadline */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="font-semibold">⏰ Deadline:</span>
          <span>{new Date(decision.deadline).toLocaleDateString()} {new Date(decision.deadline).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Sub Decisions */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">Your Decisions</h3>
        {decision.subDecisions.map(renderSubDecision)}
      </div>

      {/* Impact Preview */}
      {decision.minimumImpact.length > 0 && (
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Guaranteed Impacts</h3>
          <p className="text-sm text-gray-600 mb-4">
            These impacts will occur regardless of your choices:
          </p>
          <ImpactList impacts={decision.minimumImpact} />
        </div>
      )}
    </div>
  );
}

// Numeric Input Component
function NumericInput({ subDecision, submitted, submission, onSubmit }: any) {
  const [value, setValue] = useState(submission?.value || subDecision.numericConfig?.min || 0);
  const [showImpacts, setShowImpacts] = useState(false);

  const config = subDecision.numericConfig!;
  const impacts = config.impactCalculator(value);

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">
            Enter Value ({config.min} - {config.max} {config.unit})
          </label>
          <span className="text-2xl font-bold text-primary-600">
            {value} {config.unit}
          </span>
        </div>

        <input
          type="range"
          min={config.min}
          max={config.max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={submitted}
        />

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{config.min} {config.unit}</span>
          <span>{config.max} {config.unit}</span>
        </div>
      </div>

      <button
        onClick={() => setShowImpacts(!showImpacts)}
        className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
      >
        {showImpacts ? '▼ Hide' : '▶'} Preview Impact ({impacts.length} departments affected)
      </button>

      {showImpacts && (
        <div className="bg-gray-50 rounded-lg p-4">
          <ImpactList impacts={impacts} />
        </div>
      )}

      {!submitted && (
        <button onClick={handleSubmit} className="btn-primary w-full">
          Submit Decision
        </button>
      )}
    </div>
  );
}

// File Upload Input Component
function FileUploadInput({ subDecision, submitted, submission, onSubmit }: any) {
  const [fileData, setFileData] = useState<any>(null);

  const config = subDecision.fileConfig!;

  const handleSubmit = () => {
    if (fileData) {
      onSubmit(fileData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scoring Rubric */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="font-semibold text-blue-900 mb-1">📝 Scoring Rubric</h5>
        <p className="text-sm text-blue-800">{config.scoringRubric}</p>
      </div>

      {submitted && submission?.fileData ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-semibold text-green-800 mb-2">✓ File Submitted</p>
          <p className="text-sm text-green-700">
            {submission.fileData.fileName} ({(submission.fileData.fileSize / 1024 / 1024).toFixed(2)} MB)
          </p>
          {submission.adminScore !== undefined && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="font-semibold text-green-800">Score: {submission.adminScore}/100</p>
              {submission.adminFeedback && (
                <p className="text-sm text-green-700 mt-1">{submission.adminFeedback}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <FileUpload
            onFileSelect={setFileData}
            acceptedFormats={config.acceptedFormats}
            maxSize={config.maxSize}
            disabled={submitted}
          />

          {fileData && !submitted && (
            <button onClick={handleSubmit} className="btn-primary w-full">
              Submit Document
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Multiple Choice Input Component
function MultipleChoiceInput({ subDecision, submitted, submission, onSubmit }: any) {
  const [selectedOption, setSelectedOption] = useState<string | null>(submission?.value || null);
  const [showImpacts, setShowImpacts] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div className="space-y-3">
      {subDecision.options?.map((option: any) => (
        <div
          key={option.value}
          className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
            selectedOption === option.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
          } ${submitted ? 'opacity-75 cursor-not-allowed' : ''}`}
          onClick={() => !submitted && setSelectedOption(option.value)}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              checked={selectedOption === option.value}
              onChange={() => !submitted && setSelectedOption(option.value)}
              disabled={submitted}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800 mb-2">{option.label}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImpacts(showImpacts === option.value ? null : option.value);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                {showImpacts === option.value ? '▼ Hide' : '▶'} View Impact
              </button>

              {showImpacts === option.value && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <ImpactList impacts={option.impacts} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {!submitted && selectedOption && (
        <button onClick={handleSubmit} className="btn-primary w-full mt-4">
          Submit Decision
        </button>
      )}
    </div>
  );
}

// Impact List Component
function ImpactList({ impacts }: { impacts: DepartmentImpact[] }) {
  return (
    <div className="space-y-2">
      {impacts.map((impact, idx) => {
        const deptDisplay = getDepartmentDisplay(impact.department);
        const isPositive = impact.change > 0;

        return (
          <div key={idx} className="flex items-start gap-3 text-sm">
            <span className="text-xl">{deptDisplay.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">{deptDisplay.name}</span>
                <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{impact.change}
                </span>
              </div>
              <p className="text-gray-600">{impact.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
