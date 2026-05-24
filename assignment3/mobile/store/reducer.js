// store/reducer.js
// Pure reducer function for the global app state.

export const initialState = {
  // Auth
  user:        null,    // { id, name, email }
  token:       null,    // JWT string
  isAuthReady: false,   // true once AsyncStorage has been checked on startup

  // Tasks
  tasks:       [],
  tasksLoading:false,
  tasksError:  null,

  // Categories
  categories:     [],
  categoriesLoading: false,
  categoriesError:   null,

  // Active filter (persisted to AsyncStorage)
  activeFilter: { status: '', categoryId: '', search: '' },
};

export function reducer(state, action) {
  switch (action.type) {

    // ── AUTH ─────────────────────────────────────────────────────────────────
    case 'AUTH_READY':
      return { ...state, isAuthReady: true };

    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token };

    case 'LOGOUT':
      return {
        ...state,
        user: null, token: null,
        tasks: [], categories: [],
        activeFilter: { status: '', categoryId: '', search: '' },
      };

    // ── TASKS ────────────────────────────────────────────────────────────────
    case 'TASKS_LOADING':
      return { ...state, tasksLoading: true, tasksError: null };

    case 'TASKS_SUCCESS':
      return { ...state, tasks: action.payload, tasksLoading: false };

    case 'TASKS_ERROR':
      return { ...state, tasksError: action.payload, tasksLoading: false };

    case 'TASK_ADD':
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case 'TASK_UPDATE':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'TASK_DELETE':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    // ── CATEGORIES ───────────────────────────────────────────────────────────
    case 'CATEGORIES_LOADING':
      return { ...state, categoriesLoading: true, categoriesError: null };

    case 'CATEGORIES_SUCCESS':
      return { ...state, categories: action.payload, categoriesLoading: false };

    case 'CATEGORIES_ERROR':
      return { ...state, categoriesError: action.payload, categoriesLoading: false };

    case 'CATEGORY_ADD':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'CATEGORY_UPDATE':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'CATEGORY_DELETE':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };

    // ── FILTER ───────────────────────────────────────────────────────────────
    case 'SET_FILTER':
      return { ...state, activeFilter: { ...state.activeFilter, ...action.payload } };

    default:
      return state;
  }
}
