// ---------------------------------------------------------------------------
// Types du hook CRUD generique
// ---------------------------------------------------------------------------

/** Reponse paginee standard de l'API. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Parametres internes transmis a l'API. */
export interface CrudParams {
  page: number;
  pageSize: number;
  search: string;
  [key: string]: unknown;
}

/** Options de configuration du hook useCrud. */
export interface UseCrudOptions<T> {
  /** URL de base de la ressource (ex: "/produits"). */
  url: string;

  /** Nombre d'elements par page par defaut. */
  initialPageSize?: number;

  /** Valeur de recherche initiale. */
  initialSearch?: string;

  /** Filtres supplementaires initiaux. */
  initialFilters?: Record<string, unknown>;

  /**
   * Transforme les parametres internes en query string.
   * Utile si l'API attend des noms de parametres differents.
   *
   * Exemple :
   *   mapParams: (p) => ({ page: p.page, per_page: p.pageSize, q: p.search })
   */
  mapParams?: (params: CrudParams) => Record<string, string>;

  /**
   * Transforme chaque element de la reponse.
   * Utile si l'API renvoie un format different de T.
   */
  transform?: (item: unknown) => T;
}

/** Valeur de retour du hook useCrud. */
export interface UseCrudReturn<T> {
  // -----------------------------------------------------------------------
  // Liste
  // -----------------------------------------------------------------------

  /** Elements de la page courante. */
  items: T[];
  /** Nombre total d'elements (toutes pages confondues). */
  total: number;
  /** Nombre total de pages. */
  totalPages: number;
  /** Indique si le chargement est en cours. */
  isLoading: boolean;
  /** Message d'erreur, ou null. */
  error: string | null;

  // -----------------------------------------------------------------------
  // Pagination
  // -----------------------------------------------------------------------

  /** Page courante (commence a 1). */
  page: number;
  /** Nombre d'elements par page. */
  pageSize: number;

  /** Change la page courante. */
  setPage: (page: number) => void;
  /** Change le nombre d'elements par page (revient a la page 1). */
  setPageSize: (size: number) => void;

  // -----------------------------------------------------------------------
  // Recherche et filtres
  // -----------------------------------------------------------------------

  /** Texte de recherche courant. */
  search: string;
  /** Change le texte de recherche (revient a la page 1). */
  setSearch: (search: string) => void;
  /** Filtres supplementaires (ex: statut, categorie). */
  filters: Record<string, unknown>;
  /** Ajoute ou met a jour un filtre (revient a la page 1). */
  setFilter: (key: string, value: unknown) => void;
  /** Supprime un filtre. */
  removeFilter: (key: string) => void;
  /** Reinitialise tous les filtres. */
  resetFilters: () => void;

  // -----------------------------------------------------------------------
  // Operations CRUD
  // -----------------------------------------------------------------------

  /** Recupere un element par son ID. */
  getById: (id: string | number) => Promise<T>;
  /** Cree un element. */
  create: (data: Partial<T>) => Promise<T>;
  /** Met a jour un element. */
  update: (id: string | number, data: Partial<T>) => Promise<T>;
  /** Supprime un element. */
  remove: (id: string | number) => Promise<void>;
  /** Recharge la liste. */
  refresh: () => Promise<void>;
}
