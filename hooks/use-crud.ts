"use client";

/**
 * Hook CRUD generique avec pagination et recherche.
 *
 * Fournit les operations de base (liste, detail, creation, modification,
 * suppression) avec gestion d'etat (chargement, erreur, pagination, filtre).
 *
 * Utilisation simple :
 *   const produits = useCrud<Produit>({ url: "/produits" });
 *
 *   produits.items         // Liste paginee
 *   produits.page          // Page courante
 *   produits.setSearch("chaise")  // Recherche
 *   produits.create({ nom: "Table" })  // Creation
 *
 * Extension avec ontologies personnalisees :
 *   const produits = useCrud<Produit>({
 *     url: "/produits",
 *     mapParams: (params) => ({
 *       page: String(params.page),
 *       per_page: String(params.pageSize),
 *       q: params.search,
 *       categorie: params.categorie,
 *     }),
 *   });
 *
 *   produits.setFilter("categorie", "meubles");
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type {
  PaginatedResponse,
  CrudParams,
  UseCrudOptions,
  UseCrudReturn,
} from "@/types";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCrud<T extends Record<string, unknown>>(
  options: UseCrudOptions<T>,
): UseCrudReturn<T> {
  const {
    url,
    initialPageSize = 20,
    initialSearch = "",
    initialFilters = {},
    mapParams,
    transform,
  } = options;

  // Etat
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] =
    useState<Record<string, unknown>>(initialFilters);

  // Ref pour eviter les appels concurrents
  const abortRef = useRef<AbortController | null>(null);

  // -----------------------------------------------------------------------
  // Chargement de la liste
  // -----------------------------------------------------------------------

  const fetchList = useCallback(async () => {
    // Annuler la requete precedente si elle est encore en cours
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      // Construire les parametres
      const params: CrudParams = { page, pageSize, search, ...filters };
      const queryParams = mapParams ? mapParams(params) : params;

      const { data } = await api.get<PaginatedResponse<T> | T[]>(url, {
        params: queryParams,
        signal: controller.signal,
      });

      // Si l'API renvoie directement un tableau (non pagine)
      if (Array.isArray(data)) {
        const transformed = transform ? data.map(transform) : (data as T[]);
        setItems(transformed);
        setTotal(transformed.length);
        setTotalPages(1);
      } else {
        // Reponse paginee
        const transformed = transform
          ? data.data.map(transform)
          : (data.data as T[]);
        setItems(transformed);
        setTotal(data.total);
        setTotalPages(data.totalPages || Math.ceil(data.total / data.pageSize));
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [url, page, pageSize, search, filters, mapParams, transform]);

  // Recharger quand les dependances changent
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // -----------------------------------------------------------------------
  // Pagination
  // -----------------------------------------------------------------------

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Revenir a la premiere page
  }, []);

  // -----------------------------------------------------------------------
  // Recherche et filtres
  // -----------------------------------------------------------------------

  const handleSetSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSetFilter = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleRemoveFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSearch("");
    setPage(1);
  }, []);

  // -----------------------------------------------------------------------
  // Operations CRUD
  // -----------------------------------------------------------------------

  const getById = useCallback(
    async (id: string | number): Promise<T> => {
      const { data } = await api.get<T>(`${url}/${id}`);
      return transform ? transform(data as unknown as T) : data;
    },
    [url, transform],
  );

  const create = useCallback(
    async (payload: Partial<T>): Promise<T> => {
      const { data } = await api.post<T>(url, payload);
      toast.success("Element cree avec succes.");
      await fetchList();
      return transform ? transform(data as unknown as T) : data;
    },
    [url, transform, fetchList],
  );

  const update = useCallback(
    async (id: string | number, payload: Partial<T>): Promise<T> => {
      const { data } = await api.put<T>(`${url}/${id}`, payload);
      toast.success("Element mis a jour avec succes.");
      await fetchList();
      return transform ? transform(data as unknown as T) : data;
    },
    [url, transform, fetchList],
  );

  const remove = useCallback(
    async (id: string | number): Promise<void> => {
      await api.delete(`${url}/${id}`);
      toast.success("Element supprime avec succes.");
      await fetchList();
    },
    [url, fetchList],
  );

  // -----------------------------------------------------------------------
  // Retour
  // -----------------------------------------------------------------------

  return {
    // Liste
    items,
    total,
    totalPages,
    isLoading,
    error,
    // Pagination
    page,
    pageSize,
    setPage,
    setPageSize: handleSetPageSize,
    // Recherche et filtres
    search,
    setSearch: handleSetSearch,
    filters,
    setFilter: handleSetFilter,
    removeFilter: handleRemoveFilter,
    resetFilters: handleResetFilters,
    // Operations
    getById,
    create,
    update,
    remove,
    refresh: fetchList,
  };
}
