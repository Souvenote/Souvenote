'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Check, 
  Sparkles, 
  Camera, 
  Palette, 
  Type, 
  Layout, 
  ShieldCheck, 
  Star,
  Info,
  X,
  Plus
} from 'lucide-react';

// --- Constants ---

import PricingPopup from './PricingPopup';
import { musicApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// --- Constants ---

const OCCASION_CARDS = [
  { label: "Birthdays", icon: "🎂", color: "bg-pink-50" },
  { label: "Christmas / Holidays", icon: "🎄", color: "bg-blue-50" },
  { label: "Valentine’s Day", icon: "❤️", color: "bg-red-50" },
  { label: "Mother’s Day", icon: "🌸", color: "bg-purple-50" },
  { label: "Father’s Day", icon: "👔", color: "bg-slate-50" },
  { label: "Anniversaries", icon: "💍", color: "bg-amber-50" },
  { label: "Weddings", icon: "💒", color: "bg-emerald-50" },
  { label: "Graduations", icon: "🎓", color: "bg-indigo-50" },
  { label: "New Baby / Baby Shower", icon: "👶", color: "bg-orange-50" },
  { label: "Thank You", icon: "🙏", color: "bg-cyan-50" },
  { label: "Get Well Soon", icon: "🌼", color: "bg-yellow-50" },
  { label: "Sympathy", icon: "🕯️", color: "bg-gray-50" },
  { label: "Congratulations", icon: "🎉", color: "bg-lime-50" },
  { label: "Retirement", icon: "🏖️", color: "bg-teal-50" },
  { label: "New Home", icon: "🏠", color: "bg-brown-50" },
  { label: "Farewell", icon: "👋", color: "bg-stone-50" },
];

const OCCASIONS = OCCASION_CARDS.map(c => c.label);



const RELATIONSHIPS = [
  "Partner", "Parent", "Mentor", "Friend", "Coworker"
];

const VIBES = [
  "Funny/Wry", "Deeply Sentimental", "Joyfully Vibrant", "Professional/Formal"
];

const ART_STYLES = [
  "3D Animation", "Impressionist Painting", "Professional Photography", "Minimalist Vector"
];

const LIGHTING_OPTIONS = [
  "Golden Hour", "Cinematic Noir", "Neon Cyberpunk"
];

const FRAMING_OPTIONS = [
  "Close-up of emotional detail", "Wide-angle of the whole scene"
];

const ORIENTATIONS = [
  { label: "Portrait (10:14)", value: "10:14" },
  { label: "Landscape (14:10)", value: "14:10" },
  { label: "Square (1:1)", value: "1:1" }
];

const TRAITS = [
  "Loves quiet rainy days", "Technophile", "Always making jokes", "Nature lover", "Bookworm", "Coffee enthusiast", "Adventure seeker", "Night owl"
];

// --- Types ---

type Phase = 0 | 1 | 2 | 3 | 4 | 'generating' | 'result';
type WorkflowPath = 'workflow_1' | 'workflow_2';


interface BuildCardFormData {
  occasion: string;
  relationship: string;
  userPath: WorkflowPath;
  referenceImages: File[];
  identityPreservation: boolean;
  referenceUsage: string[];
  // Workflow 1
  vibe: string;
  personalityTraits: string[];
  metaphor: string;
  artStyle: string;
  // Workflow 2
  sceneDescription: string;
  environment: string;
  lighting: string;
  framing: string;
  // Phase 3
  orientation: string;
  grounding: boolean;
  textContent: string;
  placement: string;
}

// --- Main Component ---

export default function BuildMyCard() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [creditsUnavailable, setCreditsUnavailable] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<BuildCardFormData>({
    occasion: '',
    relationship: '',
    userPath: 'workflow_1',
    referenceImages: [],
    identityPreservation: false,
    referenceUsage: [],
    vibe: '',
    personalityTraits: [],
    metaphor: '',
    artStyle: '',
    sceneDescription: '',
    environment: '',
    lighting: '',
    framing: '',
    orientation: '10:14',
    grounding: false,
    textContent: '',
    placement: '',
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCredits = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        if (isMounted) {
          setUserCredits(0);
          setCreditsUnavailable(false);
        }
        return;
      }

      try {
        const credits = await musicApi.getCredits();

        if (isMounted) {
          setUserCredits(credits.image);
          setCreditsUnavailable(false);
        }
      } catch {
        if (isMounted) {
          setUserCredits(0);
          setCreditsUnavailable(true);
        }
      }
    };

    void loadCredits();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  const isCheckingCredits = authLoading || userCredits === null;

  const buildDesignPrompt = () => {
    const promptParts = [
      'personalized greeting card design',
      formData.occasion ? `for ${formData.occasion.toLowerCase()}` : null,
      formData.relationship ? `for a ${formData.relationship.toLowerCase()}` : null,
      formData.userPath === 'workflow_1'
        ? formData.vibe
          ? `${formData.vibe.toLowerCase()} mood`
          : null
        : null,
      formData.userPath === 'workflow_1' && formData.artStyle
        ? `${formData.artStyle.toLowerCase()} art style`
        : null,
      formData.userPath === 'workflow_1' && formData.metaphor
        ? `inspired by ${formData.metaphor}`
        : null,
      formData.personalityTraits.length > 0
        ? `reflecting ${formData.personalityTraits.join(', ')}`
        : null,
      formData.sceneDescription || null,
      formData.environment ? `set in ${formData.environment}` : null,
      formData.lighting ? `${formData.lighting.toLowerCase()} lighting` : null,
      formData.framing ? `${formData.framing.toLowerCase()} framing` : null,
      formData.orientation ? `${formData.orientation} composition` : null,
      formData.referenceImages.length > 0 ? 'based on uploaded reference images' : null,
      formData.identityPreservation ? 'preserve subject identity from references' : null,
      formData.textContent ? `front text says "${formData.textContent}"` : null,
      formData.placement ? `text placement ${formData.placement}` : null,
      formData.grounding ? 'grounded in real-world details' : null,
    ];

    return promptParts.filter(Boolean).join(', ');
  };

  const handleApproveAndSave = () => {
    if (!generatedImageUrl || isApproving) {
      return;
    }

    setIsApproving(true);

    const searchParams = new URLSearchParams({
      designPrompt: buildDesignPrompt(),
    });

    if (formData.occasion) {
      searchParams.set('occasion', formData.occasion);
    }

    if (formData.relationship) {
      searchParams.set('recipientRelationship', formData.relationship);
    }

    if (formData.textContent) {
      searchParams.set('message', formData.textContent);
    }

    router.push(`/create/music?${searchParams.toString()}`);
  };

  const updateField = (field: keyof BuildCardFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setPhase(prev => {
      if (typeof prev === 'number' && prev < 4) return (prev + 1) as Phase;
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setPhase(prev => {
      if (typeof prev === 'number' && prev > 0) return (prev - 1) as Phase;
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  const handleCreateNow = () => {
    if (isCheckingCredits) {
      return;
    }

    if (!creditsUnavailable && (userCredits ?? 0) <= 0) {
        setPricingOpen(true);
        return;
    }
    setPhase('generating');
    // Simulate generation delay
    setTimeout(() => {
        setGeneratedImageUrl('https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2070&auto=format&fit=crop'); // Mock URL
        setPhase('result');
    }, 3500);
  };


  const toggleTrait = (trait: string) => {
    setFormData(prev => {
      const traits = prev.personalityTraits.includes(trait)
        ? prev.personalityTraits.filter(t => t !== trait)
        : prev.personalityTraits.length < 3 
          ? [...prev.personalityTraits, trait]
          : prev.personalityTraits;
      return { ...prev, personalityTraits: traits };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        referenceImages: [...prev.referenceImages, ...newFiles].slice(0, 14)
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index)
    }));
  };

  // --- Render Steps ---

  const renderGenerating = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-black/5 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-black animate-pulse" />
        </div>
        <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-t-black border-transparent animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Nano Banana 2 is working...</h3>
        <p className="text-gray-400 text-sm">Generating your high-fidelity, print-ready design (~15-30s)</p>
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] pt-2">Powered by GPT-4o mini</p>
      </div>

      <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-black animate-progress-fast" />
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image Preview */}
            <div className={`aspect-[${formData.orientation.split(':').join('/')}] bg-gray-100 rounded-[40px] shadow-2xl overflow-hidden relative group`}>
                <img src={generatedImageUrl!} alt="Generated Card" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Actions */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">Generation Complete</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">How does it look?</h2>
                    <p className="text-gray-500 leading-relaxed">
                        Your {formData.occasion} card for {formData.relationship} has been generated with professional print-ready specs.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleApproveAndSave}
                        disabled={isApproving}
                        className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isApproving ? 'Opening Music Flow...' : 'Approve & Save'} <Star className="w-5 h-5 fill-white" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={handleCreateNow}
                            className="py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                        >
                            Regenerate <Sparkles className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setPhase(2)}
                            className="py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                        >
                            Edit Prompt <Palette className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );


  const renderPhase0 = () => (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
          Let's Build Your Card!
        </h1>
        <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
          Answer a few questions and our in-house artist will design the perfect greeting card.
        </p>
      </div>

      <div className="space-y-12 max-w-6xl mx-auto">
        {/* Intake Box */}
        <div className="relative group max-w-3xl mx-auto">
          <input 
            type="text" 
            placeholder="e.g., My sister's 30th birthday in Paris..."
            value={formData.occasion}
            onChange={(e) => updateField('occasion', e.target.value)}
            className="w-full px-8 py-7 bg-white border-2 border-gray-100 rounded-[35px] text-lg font-medium focus:outline-none focus:border-black transition-all shadow-sm hover:shadow-xl pr-36"
          />
          <button 
            onClick={handleNext}
            disabled={!formData.occasion}
            className="absolute right-3 top-3 bottom-3 px-10 bg-black text-white rounded-3xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-20 shadow-lg active:scale-95"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-gray-100 flex-1" />
            <label className="text-xs font-black uppercase tracking-widest text-gray-300 shrink-0">Popular Occasions</label>
            <div className="h-px bg-gray-100 flex-1" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {OCCASION_CARDS.map(occ => (
              <button
                key={occ.label}
                onClick={() => {
                  updateField('occasion', occ.label);
                  handleNext();
                }}
                className={`group flex flex-col items-center p-8 rounded-[40px] border-2 transition-all hover:scale-[1.05] hover:shadow-2xl hover:z-10 ${
                  formData.occasion === occ.label 
                  ? 'border-black bg-gray-50 scale-105 shadow-xl' 
                  : 'border-transparent bg-gray-50/50 hover:bg-white hover:border-gray-200'
                }`}
              >
                <div className={`w-20 h-28 ${occ.color} rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-sm group-hover:-rotate-6 transition-all`}>
                  {occ.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors text-center">{occ.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhase1 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Phase 1: Recipients & Vision</h2>
        <p className="text-gray-500">Tell us who this is for and choose your creation path.</p>
      </div>

      <div className="space-y-10">
        {/* Relationship */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Who is the recipient?</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map(rel => (
              <button
                key={rel}
                onClick={() => updateField('relationship', rel)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${
                  formData.relationship === rel 
                  ? 'bg-black text-white border-black shadow-lg scale-105 z-10' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Path */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Choose your path</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
                <button 
                onClick={() => updateField('userPath', 'workflow_1')}
                className={`flex-1 p-8 rounded-[45px] border-2 text-left transition-all relative ${
                    formData.userPath === 'workflow_1' ? 'border-black bg-gray-50 shadow-2xl z-10' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
                >
                <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                        <Sparkles className={`w-7 h-7 ${formData.userPath === 'workflow_1' ? 'text-black' : 'text-gray-300'}`} />
                    </div>
                    {formData.userPath === 'workflow_1' && <Check className="w-6 h-6 text-black" />}
                </div>
                <h4 className="text-2xl font-black text-gray-900 leading-tight">I need inspiration</h4>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed font-medium">Concept-led. Our AI artist will help you explore vibes and metaphors to evoke the perfect emotion.</p>
                </button>
                {formData.userPath === 'workflow_1' && (
                    <button 
                        onClick={handleCreateNow}
                        disabled={isCheckingCredits}
                        className="w-full py-5 bg-black text-white rounded-3xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 animate-in slide-in-from-top-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isCheckingCredits ? 'Checking credits...' : 'Create Now!'}
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <button 
                onClick={() => updateField('userPath', 'workflow_2')}
                className={`flex-1 p-8 rounded-[45px] border-2 text-left transition-all relative ${
                    formData.userPath === 'workflow_2' ? 'border-black bg-gray-50 shadow-2xl z-10' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
                >
                <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                        <Camera className={`w-7 h-7 ${formData.userPath === 'workflow_2' ? 'text-black' : 'text-gray-300'}`} />
                    </div>
                    {formData.userPath === 'workflow_2' && <Check className="w-6 h-6 text-black" />}
                </div>
                <h4 className="text-2xl font-black text-gray-900 leading-tight">I have a specific vision</h4>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed font-medium">User-led. You define the scene, environment, lighting, and framing with cinematic precision.</p>
                </button>
                {formData.userPath === 'workflow_2' && (
                    <button 
                        onClick={handleCreateNow}
                        disabled={isCheckingCredits}
                        className="w-full py-5 bg-black text-white rounded-3xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 animate-in slide-in-from-top-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isCheckingCredits ? 'Checking credits...' : 'Create Now!'}
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* Reference Images */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Reference Images (Optional)</label>
            <span className="text-[10px] text-gray-400 font-bold">{formData.referenceImages.length}/14 images</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {formData.referenceImages.map((img, idx) => (
              <div key={idx} className="aspect-square bg-gray-100 rounded-2xl relative overflow-hidden group shadow-sm">
                <img src={URL.createObjectURL(img)} alt="ref" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {formData.referenceImages.length < 14 && (
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-black/20 hover:bg-gray-50 transition-all">
                <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                <Plus className="w-6 h-6 text-gray-300" />
              </label>
            )}
          </div>
          
          {formData.referenceImages.length > 0 && (
            <div className="bg-gray-50 p-8 rounded-[35px] space-y-6 animate-in slide-in-from-top-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-900">Subject Identity Preservation</h4>
                    <p className="text-xs text-gray-400 italic">Keep the person's face exactly as shown in the upload.</p>
                </div>
                <button 
                  onClick={() => updateField('identityPreservation', !formData.identityPreservation)}
                  className={`w-14 h-7 rounded-full transition-all relative ${formData.identityPreservation ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.identityPreservation ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-12 border-t border-gray-100 flex justify-between items-center">
        <button onClick={handleBack} className="px-10 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl font-bold flex items-center gap-2 hover:border-black hover:text-black transition-all">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button 
          onClick={handleNext} 
          disabled={!formData.relationship}
          className="px-12 py-5 bg-black text-white rounded-3xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-30 shadow-2xl active:scale-95"
        >
          Next Step <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );


  const renderPhase2 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Phase 2: Creative Direction</h2>
        <p className="text-gray-500">
          {formData.userPath === 'workflow_1' ? "Let's explore some inspiration together." : "Tell us about your specific vision."}
        </p>
      </div>

      {formData.userPath === 'workflow_1' ? (
        /* Workflow 1: Inspiration Path */
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Pick a 'Vibe'</label>
            <div className="grid grid-cols-2 gap-3">
              {VIBES.map(v => (
                <button
                  key={v}
                  onClick={() => updateField('vibe', v)}
                  className={`p-5 rounded-2xl border-2 text-sm font-bold transition-all text-left ${formData.vibe === v ? 'border-black bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Personality Match</label>
              <span className="text-[10px] text-gray-400 font-bold">{formData.personalityTraits.length}/3 selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRAITS.map(trait => (
                <button
                  key={trait}
                  onClick={() => toggleTrait(trait)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    formData.personalityTraits.includes(trait) 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Metaphorical Subject</label>
            <p className="text-xs text-gray-400">If this card were an animal or object, it would be...</p>
            <input 
              type="text" 
              placeholder="e.g., A whimsical giraffe"
              value={formData.metaphor}
              onChange={(e) => updateField('metaphor', e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Art Style (Select a 'Lens')
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ART_STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => updateField('artStyle', style)}
                  className={`p-4 rounded-xl border-2 text-[10px] font-bold uppercase tracking-wider transition-all ${formData.artStyle === style ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Workflow 2: Precision Path */
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Describe the central action</label>
            <textarea 
              rows={4}
              placeholder="e.g., Two people laughing over steaming carbonara in a cozy kitchen"
              value={formData.sceneDescription}
              onChange={(e) => updateField('sceneDescription', e.target.value)}
              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-black/5 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Where does this take place?</label>
            <input 
              type="text" 
              placeholder="e.g., A dimly lit Roman trattoria"
              value={formData.environment}
              onChange={(e) => updateField('environment', e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Atmospheric Lighting</label>
              <div className="space-y-2">
                {LIGHTING_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => updateField('lighting', opt)}
                    className={`w-full p-4 rounded-xl border-2 text-sm font-bold transition-all text-left flex justify-between items-center ${formData.lighting === opt ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'}`}
                  >
                    {opt}
                    {formData.lighting === opt && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Compositional Framing</label>
              <div className="space-y-2">
                {FRAMING_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => updateField('framing', opt)}
                    className={`w-full p-4 rounded-xl border-2 text-sm font-bold transition-all text-left flex justify-between items-center ${formData.framing === opt ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'}`}
                  >
                    {opt}
                    {formData.framing === opt && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-8 border-t border-gray-100 flex justify-between">
        <button onClick={handleBack} className="px-8 py-4 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={handleNext} className="px-10 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl">
          Next Step <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderPhase3 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Phase 3: Print Production</h2>
        <p className="text-gray-500">Ensures the output is professional-grade and print-ready.</p>
      </div>

      <div className="space-y-10">
        {/* Card Orientation */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Card Orientation & Format</label>
          <div className="grid grid-cols-3 gap-4">
            {ORIENTATIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateField('orientation', opt.value)}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${
                  formData.orientation === opt.value ? 'border-black bg-gray-50 shadow-md scale-105' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`border-2 rounded border-gray-200 ${
                  opt.value === '10:14' ? 'w-6 h-8' : opt.value === '14:10' ? 'w-8 h-6' : 'w-7 h-7'
                }`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
          <Info className="w-6 h-6 text-blue-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900">Full-Bleed Subject Safety</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Artwork will automatically extend to all four edges. Background will fill the bleed area with no white borders.
            </p>
          </div>
        </div>

        {/* Grounding */}
        <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Ground in Reality?</h4>
            <p className="text-xs text-gray-500">Enables Google Search for accurate real-world landmarks.</p>
          </div>
          <button 
            onClick={() => updateField('grounding', !formData.grounding)}
            className={`w-12 h-6 rounded-full transition-all relative ${formData.grounding ? 'bg-black' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.grounding ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Typography */}
        <div className="space-y-6">
          <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Typography & Message</label>
          <div className="space-y-6 bg-gray-50 p-8 rounded-[32px]">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Content</label>
              <textarea 
                rows={3}
                placeholder="e.g., Happy Birthday, Sarah!"
                value={formData.textContent}
                onChange={(e) => updateField('textContent', e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Text Placement</label>
              <input 
                type="text" 
                placeholder="e.g., Centered near the top within safe area"
                value={formData.placement}
                onChange={(e) => updateField('placement', e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-black/5"
              />
            </div>
            <div className="p-4 bg-white/50 rounded-xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                <Type className="w-3 h-3" /> Note on Font
              </div>
              <p className="text-[10px] text-gray-400">
                Font personality is automatically matched to your visual vibe and art style.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between">
        <button onClick={handleBack} className="px-8 py-4 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={handleNext} className="px-10 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl">
          Complete Review <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderPhase4 = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Phase 4: Safety & Review</h2>
        <p className="text-gray-500">Your design is ready for high-fidelity generation.</p>
      </div>

      <div className="bg-gray-50 rounded-[40px] p-8 md:p-12 space-y-10">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{formData.occasion} Card</h3>
            <p className="text-sm text-gray-400">For your {formData.relationship}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workflow Path</label>
              <p className="font-bold">{formData.userPath === 'workflow_1' ? 'Inspiration-led' : 'Precision-led'}</p>
            </div>
            
            {formData.userPath === 'workflow_1' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Style & Vibe</label>
                  <p className="font-bold">{formData.vibe || 'Not selected'} • {formData.artStyle || 'Not selected'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personality Traits</label>
                  <div className="flex gap-2 flex-wrap">
                    {formData.personalityTraits.map(t => <span key={t} className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 font-bold">{t}</span>)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scene</label>
                  <p className="text-sm font-medium leading-relaxed">{formData.sceneDescription || 'None'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atmosphere</label>
                  <p className="font-bold">{formData.lighting} • {formData.framing}</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Layout</label>
              <p className="font-bold">{formData.orientation} Orientation</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message</label>
              <p className="text-sm italic text-gray-600 bg-white p-4 rounded-xl shadow-sm border border-gray-100">"{formData.textContent || 'No message provided'}"</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grounding</label>
              <p className="font-bold">{formData.grounding ? 'Google Search Enabled' : 'Standard Generation'}</p>
            </div>
          </div>
        </div>

        {/* Safety Footer */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-green-600">
            <ShieldCheck className="w-4 h-4" /> AUTO-APPEND SAFETY PROMPTS ENABLED
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider">
            Category: Legal/IP, Print Quality, Layout Safety, Content Safety.
            System will automatically remove artifacts like "white borders", "extra fingers", and "branded logos" during generation.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={handleBack} className="px-10 py-5 border border-gray-200 rounded-3xl font-bold hover:bg-gray-50">
          Edit
        </button>
        <button 
          onClick={handleCreateNow}
          disabled={isCheckingCredits}
          className="flex-1 py-5 bg-gradient-to-r from-black to-gray-800 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {isCheckingCredits ? 'Checking credits...' : 'Create Now (1 Credit)'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Questionnaire Header - Hide during generation/result for immersion */}
      {typeof phase === 'number' && (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map(p => (
                <div key={p} className="flex flex-col items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    phase === p ? 'bg-black text-white ring-4 ring-black/10' : phase > p ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'
                  }`}>
                    {phase > p ? <Check className="w-3 h-3" /> : p}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Step {phase} of 4</span>
               <h4 className="text-xs font-bold text-black">{phase === 1 ? 'Parameters' : phase === 2 ? 'Creative' : phase === 3 ? 'Production' : 'Review'}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {phase === 0 && renderPhase0()}
        {phase === 1 && renderPhase1()}
        {phase === 2 && renderPhase2()}
        {phase === 3 && renderPhase3()}
        {phase === 4 && renderPhase4()}
        {phase === 'generating' && renderGenerating()}
        {phase === 'result' && renderResult()}
      </div>

      <PricingPopup isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />


      <style jsx global>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

