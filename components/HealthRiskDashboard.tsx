import React, { useState } from 'react';

type HealthCondition = 'Asthma' | 'Heart Issues' | 'Allergies' | 'Sinus' | 'Cold/Flu' | 'Chronic (COPD)';

interface HealthRiskDashboardProps {
  onBack: () => void;
}

const HealthRiskDashboard: React.FC<HealthRiskDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<HealthCondition>('Asthma');

  // Updated to use standard Material Symbols that are guaranteed to render correctly
  const conditions: { id: HealthCondition; icon: string; label: string }[] = [
    { id: 'Asthma', icon: 'air', label: 'Asthma' },
    { id: 'Heart Issues', icon: 'monitor_heart', label: 'Heart Issues' },
    { id: 'Allergies', icon: 'grain', label: 'Allergies' }, // grain looks like pollen/dust
    { id: 'Sinus', icon: 'face', label: 'Sinus' },
    { id: 'Cold/Flu', icon: 'thermostat', label: 'Cold/Flu' },
    { id: 'Chronic (COPD)', icon: 'mask', label: 'Chronic (COPD)' },
  ];

  const contentData: Record<HealthCondition, {
    image: string;
    riskLabel: string;
    riskColor: string; // Tailwind color class for bg
    description: React.ReactNode;
    symptoms: string;
    dos: string[];
    donts: string[];
  }> = {
    'Asthma': {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAurzp8zmxHW8bCzKpesvmVkPCx6qWsp0iHBH9o7O2x2Qh_dGpxc0bKKpyrz0crqB8gjaBdlxEUHUAX8PV0avl9QTN2pUsV_o0K0fP0xnk2P-R13EqS8a96hxH0Ro-BEEy-t11kJnJLXqge-ihqcC4lFbGN9ZPdDAac18ZruGKe73HcolBOj3SIesjYtpEy4qbnkXQBd8GajKFgRP3V-VsB-IAdTlJfmgyURm3lrmOGaTzTWofIl7G6A03N8gNoZ8sP74R59rq8oGU',
      riskLabel: 'High Chances of Asthma',
      riskColor: 'bg-red-600',
      description: (
        <>
          Risk of <span className="font-bold text-slate-900 dark:text-slate-100">Asthma</span> symptoms is <span className="text-red-500 font-bold">High</span> when AQI is <span className="text-red-500 font-bold">Severe (150-301)</span>.
        </>
      ),
      symptoms: 'Severe symptoms including intense wheezing, severe shortness of breath, significant chest tightness, and persistent coughing that may disrupt daily activities.',
      dos: [
        'Avoid going outside and keep windows closed to reduce exposure to pollutants.',
        'Take prescribed medications as directed by your healthcare provider.',
        'Maintain clean indoor air with air purifiers, especially in bedrooms and living areas.'
      ],
      donts: [
        'Smoke or expose yourself to secondhand smoke.',
        'Engage in physical exertion outdoors.'
      ]
    },
    'Heart Issues': {
      image: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png', // Placeholder or use appropriate asset
      riskLabel: 'Moderate Risk for Heart Patients',
      riskColor: 'bg-orange-500',
      description: (
        <>
          Increased strain on the heart. Risk of <span className="font-bold text-slate-900 dark:text-slate-100">cardiovascular events</span> is <span className="text-orange-500 font-bold">Moderate</span>.
        </>
      ),
      symptoms: 'Palpitations, mild chest discomfort, or shortness of breath during light activities.',
      dos: [
        'Monitor blood pressure regularily.',
        'Keep stress levels low and stay hydrated.',
        'Consult a doctor if chest discomfort persists.'
      ],
      donts: [
        'Engage in heavy lifting or strenuous cardio.',
        'Skip prescribed heart medications.'
      ]
    },
    'Allergies': {
      image: 'https://cdn-icons-png.flaticon.com/512/2966/2966486.png',
      riskLabel: 'Severe Allergy Triggers',
      riskColor: 'bg-red-500',
      description: (
        <>
          High concentration of allergens. <span className="font-bold text-slate-900 dark:text-slate-100">Allergic reactions</span> are likely to be <span className="text-red-500 font-bold">Severe</span>.
        </>
      ),
      symptoms: 'Sneezing, runny nose, red/watery eyes, and itchy throat.',
      dos: [
        'Wear a mask when outdoors.',
        'Shower after coming home to remove pollen/dust.',
        'Use antihistamines as prescribed.'
      ],
      donts: [
        'Dry clothes outside.',
        'Rub your eyes with unwashed hands.'
      ]
    },
    'Sinus': {
      image: 'https://cdn-icons-png.flaticon.com/512/3022/3022343.png',
      riskLabel: 'High Risk of Sinusitis',
      riskColor: 'bg-yellow-500',
      description: (
        <>
          Pollution may aggravate <span className="font-bold text-slate-900 dark:text-slate-100">Sinus</span> inflammation. Risk is <span className="text-yellow-500 font-bold">Elevated</span>.
        </>
      ),
      symptoms: 'Facial pressure, headache, and congestion.',
      dos: [
        'Use saline nasal sprays to keep passages moist.',
        'Steam inhalation can provide relief.',
        'Drink warm fluids.'
      ],
      donts: [
        'Use strong fragrances or cleaners.',
        'Sleep flat on your back (prop up your head).'
      ]
    },
    'Cold/Flu': {
      image: 'https://cdn-icons-png.flaticon.com/512/2853/2853927.png',
      riskLabel: 'Viral Susceptibility',
      riskColor: 'bg-orange-500',
      description: (
        <>
          Poor air quality weakens immunity. Susceptibility to <span className="font-bold text-slate-900 dark:text-slate-100">Cold & Flu</span> is <span className="text-orange-500 font-bold">Increased</span>.
        </>
      ),
      symptoms: 'Sore throat, fatigue, and mild fever.',
      dos: [
        'Wash hands frequently.',
        'Eat immunity-boosting foods (Vitamin C).',
        'Rest adequately.'
      ],
      donts: [
        'Share utensils or towels.',
        'Go to crowded places without a mask.'
      ]
    },
    'Chronic (COPD)': {
      image: 'https://cdn-icons-png.flaticon.com/512/3022/3022067.png',
      riskLabel: 'Critical Danger for COPD',
      riskColor: 'bg-red-700',
      description: (
        <>
          <span className="font-bold text-slate-900 dark:text-slate-100">COPD</span> patients face <span className="text-red-700 font-bold">Critical Risk</span> of exacerbation.
        </>
      ),
      symptoms: 'Extreme difficulty breathing, productive cough, and fatigue.',
      dos: [
        'Keep rescue inhalers accessible at all times.',
        'Use continuous oxygen if prescribed.',
        'Go to the ER immediately if breathing becomes difficult.'
      ],
      donts: [
        'Miss any dose of maintenance medication.',
        'Using wood-burning stoves or fireplaces.'
      ]
    },
  };

  const currentContent = contentData[activeTab];

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark overflow-y-auto animate-in fade-in duration-300 font-display">
      <main className="max-w-6xl mx-auto px-6 py-8 pb-32">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-slate-900 dark:text-white">Prevent Health Problems: Understand Your Risks</h1>
            <div className="flex items-center text-primary font-medium">
              <span className="material-symbols-outlined mr-1 text-lg">location_on</span>
              <span>Delhi (Citizen View)</span>
            </div>
          </div>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">close</span>
          </button>
        </header>

        <nav className="flex space-x-3 mb-8 overflow-x-auto pb-4 custom-scrollbar no-scrollbar scroll-smooth">
          {conditions.map((condition) => (
            <button
              key={condition.id}
              onClick={() => setActiveTab(condition.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all whitespace-nowrap shadow-sm border ${activeTab === condition.id
                ? 'bg-primary text-[#102222] border-primary font-bold shadow-lg shadow-primary/20 scale-105'
                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className={`material-symbols-outlined ${activeTab === condition.id ? 'text-[#102222]' : 'text-slate-500'}`}>
                {condition.icon}
              </span>
              <span className="font-medium">{condition.label}</span>
            </button>
          ))}
        </nav>

        <div className="bg-white dark:bg-card-dark rounded-[1.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px] border border-slate-100 dark:border-slate-800">
          {/* Illustration Side */}
          <div className="md:w-1/3 bg-[#f3c1c1] dark:bg-[#4a3a3a] p-8 flex flex-col items-center justify-between relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="20" cy="20" fill="currentColor" r="40"></circle>
                <circle cx="180" cy="180" fill="currentColor" r="60"></circle>
              </svg>
            </div>
            <div className="relative z-10 w-full flex flex-col items-center flex-grow justify-center">
              <img
                key={currentContent.image} // Force re-render for animation
                alt={`Illustration for ${activeTab}`}
                className="max-w-full h-auto mb-8 mix-blend-multiply dark:mix-blend-normal rounded-lg animate-in zoom-in-90 duration-500"
                src={currentContent.image || 'https://via.placeholder.com/300?text=Health+Illustration'}
              />
              <div className={`w-full max-w-xs ${currentContent.riskColor} text-white py-3 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-black/20`}>
                <span className="material-symbols-outlined text-lg">error</span>
                <span className="font-semibold tracking-wide uppercase text-sm text-center">{currentContent.riskLabel}</span>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="md:w-2/3 p-8 lg:p-12 flex flex-col bg-slate-50 dark:bg-[#1f2937]">
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div className="md:w-1/2 mb-6 md:mb-0 pr-4">
                <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">{activeTab}</h2>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {currentContent.description}
                </p>
              </div>
              <div className="md:w-1/2 md:pl-8 border-l border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 italic">
                  {currentContent.symptoms}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-auto">
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center text-green-600 dark:text-green-400">
                  Do's :
                </h3>
                <ul className="space-y-4">
                  {currentContent.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                      <span className="text-slate-600 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center text-red-600 dark:text-red-400">
                  Don'ts :
                </h3>
                <ul className="space-y-4">
                  {currentContent.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="material-symbols-outlined text-red-500 mt-0.5">cancel</span>
                      <span className="text-slate-600 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-500 dark:text-slate-500 text-center max-w-4xl mx-auto italic">
          Disclaimer: The above health risks are precautionary suggestions based on environmental conditions. Exposure to air pollution can contribute to these health conditions. Always consult a medical professional for personalized advice.
        </p>
      </main>

      {/* Floating Bottom Nav (Decorative mostly in this context, or functional if needed) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center space-x-1 p-1.5 bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-2xl border border-white/10">
          <button onClick={onBack} className="flex items-center space-x-2 px-6 py-2.5 rounded-full hover:bg-white/10 text-white transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm font-medium">Back to Main</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2.5 rounded-full hover:bg-white/10 text-white transition-colors">
            <span className="material-symbols-outlined text-sm">thermostat</span>
            <span className="text-sm font-medium">Climate Context</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default HealthRiskDashboard;
