/**
 * Lógica de interpretação de mensagens e controle de fluxo
 */

export type StepId = 'START' | 'P1' | 'P1_FOLLOWUP' | 'P2' | 'P3' | 'SUCCESS' | 'END';

export interface Step {
  id: StepId;
  message: string;
  options?: {
    A: string[];
    B: string[];
    C: string[];
  };
  next?: {
    A: StepId;
    B: StepId;
    C: StepId;
    UNIDENTIFIED?: StepId;
  };
}

// Função para normalizar texto (remover acentos, espaços extras e converter para minúsculo)
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Palavras-chave para cada etapa
export const STEPS: Record<StepId, Step> = {
  START: {
    id: 'START',
    message: "Oii 😊 antes de te direcionar para falar com o William, preciso te fazer 3 perguntas rápidas pra entender se esse projeto realmente faz sentido pra você. Pode ser?",
    options: {
      A: ['sim', 'pode', 'claro', 'ok', 'bora', 'com certeza', 'aceito', 'quero', 's', 'pode ser', 'com certeza'],
      B: [], // Não usado aqui
      C: ['nao', 'agora nao', 'obrigado', 'n', 'nem pensar']
    },
    next: {
      A: 'P1',
      B: 'P1', // Fallback
      C: 'END',
      UNIDENTIFIED: 'START'
    }
  },
  P1: {
    id: 'P1',
    message: "Hoje você está buscando:\n\nA) Uma renda extra trabalhando de casa\nB) Uma nova fonte de renda principal\nC) Só estou curioso(a)",
    options: {
      A: ['a', 'extra', 'casa', 'trabalhando', 'renda extra', 'bico', 'complemento', 'trabalhar de casa'],
      B: ['b', 'principal', 'viver disso', 'fonte', 'carreira', 'integral', 'foco', 'minha fonte'],
      C: ['c', 'curioso', 'olhando', 'vendo', 'curiosidade', 'saber mais', 'so vendo', 'so curioso']
    },
    next: {
      A: 'P2',
      B: 'P2',
      C: 'P1_FOLLOWUP'
    }
  },
  P1_FOLLOWUP: {
    id: 'P1_FOLLOWUP',
    message: "Entendi 😊 esse projeto é pra quem realmente quer colocar em prática. Você pretende aplicar se fizer sentido pra você?",
    options: {
      A: ['sim', 'vou', 'pretendo', 'aplicar', 'quero', 's', 'com certeza', 'pode ser'],
      B: [],
      C: ['nao', 'so curioso', 'so olhando', 'n', 'nao pretendo']
    },
    next: {
      A: 'P2',
      B: 'P2',
      C: 'END'
    }
  },
  P2: {
    id: 'P2',
    message: "O William trabalha com alho há mais de 6 anos, tem mais de 6 mil seguidores e já ajudou mais de 140 pessoas a começarem.\n\nSe ele te mostrar o passo a passo simples usando só o celular, você teria pelo menos 1 hora por dia pra aplicar?\n\nA) Tenho sim\nB) Depende\nC) Não tenho tempo",
    options: {
      A: ['a', 'tenho', 'sim', 'com certeza', 'consigo', 'posso', '1 hora', 'uma hora', 'tenho sim'],
      B: ['b', 'depende', 'talvez', 'ver', 'preciso ver', 'nao sei', 'dependendo'],
      C: ['c', 'nao tenho', 'sem tempo', 'corrido', 'impossivel', 'nao', 'n', 'tenho nao']
    },
    next: {
      A: 'P3',
      B: 'P3',
      C: 'END'
    }
  },
  P3: {
    id: 'P3',
    message: "Pra entrar no projeto é necessário um pequeno investimento inicial (menos do que você gasta em uma pizza 🍕).\n\nSe fizer sentido pra você, isso seria um problema?\n\nA) Não seria problema\nB) Depende do valor\nC) No momento não posso investir nada",
    options: {
      A: ['a', 'nao seria', 'problema nao', 'tranquilo', 'posso', 'sim', 'nao e problema', 'ok', 'sem problema'],
      B: ['b', 'depende', 'valor', 'quanto', 'preciso saber', 'dependendo', 'depende do valor'],
      C: ['c', 'nao posso', 'sem dinheiro', 'nada', 'investir nada', 'impossivel', 'n', 'agora nao']
    },
    next: {
      A: 'SUCCESS',
      B: 'SUCCESS',
      C: 'END'
    }
  },
  SUCCESS: {
    id: 'SUCCESS',
    message: "Perfeito 👏 pelo que você me respondeu, seu perfil é ideal.\n\nO William vai falar com você pessoalmente agora e explicar como você pode começar ainda essa semana.\n\nClique no botão abaixo para falar direto com ele 👇",
  },
  END: {
    id: 'END',
    message: "Entendo perfeitamente 😊 talvez esse não seja o melhor momento pra você. Quando decidir começar algo de verdade ou estiver pronto(a), será um prazer te receber!",
  }
};

export function interpretAnswer(stepId: StepId, userInput: string): 'A' | 'B' | 'C' | null {
  const step = STEPS[stepId];
  if (!step || !step.options) return null;

  const normalized = normalizeText(userInput);

  // 1. Verificar se é exatamente A, B ou C
  if (normalized === 'a') return 'A';
  if (normalized === 'b') return 'B';
  if (normalized === 'c') return 'C';

  // 2. Verificar palavras-chave
  for (const key of ['A', 'B', 'C'] as const) {
    const keywords = step.options[key];
    if (keywords.some(kw => normalized.includes(normalizeText(kw)))) {
      return key;
    }
  }

  return null;
}
