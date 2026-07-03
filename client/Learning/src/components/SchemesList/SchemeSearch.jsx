import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

const highlightMatch = (text, query) => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? <strong key={i} className="text-emerald-700 bg-emerald-100">{part}</strong> : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default function SchemeSearch({ initialQuery = '', onSearchSubmit }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialQuery);
  const debouncedQ = useDebounce(inputValue, 300);
  const navigate = useNavigate();

  // Keep input value in sync with external changes (e.g. clear filters)
  useEffect(() => {
    setInputValue(initialQuery);
  }, [initialQuery]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['schemesSearchTypeahead', debouncedQ],
    queryFn: async ({ signal }) => {
      if (!debouncedQ.trim()) return [];
      const res = await axios.get(`${API_BASE_URL}/schemes?q=${encodeURIComponent(debouncedQ)}&limit=5`, { signal });
      return res.data?.data?.scheme || [];
    },
    enabled: debouncedQ.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const suggestions = [
    "Agriculture",
    "Insurance",
    "Education",
    "Housing",
    "Livestock"
  ];

  return (
    <div className="relative w-full sm:w-52 md:w-64">
      <Command 
        shouldFilter={false} 
        className="relative bg-white border border-gray-300 rounded-lg overflow-visible focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500"
      >
        <div className="flex items-center px-3 border-b border-transparent">
          <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Command.Input
            value={inputValue}
            onValueChange={(val) => {
              setInputValue(val);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setOpen(false);
                onSearchSubmit(inputValue);
              }
              if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
            placeholder="Search schemes..."
            className="w-full py-2.5 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
            aria-label="Search schemes"
          />
        </div>

        {open && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
            <Command.List className="max-h-[300px] overflow-y-auto p-1">
              <div aria-live="polite" className="sr-only">
                {isLoading ? 'Loading results' : data ? `${data.length} results found` : ''}
              </div>

              {!debouncedQ && (
                <Command.Group heading="Suggested Categories" className="text-xs font-semibold text-gray-500">
                  <div className="p-2 pb-0"></div>
                  {suggestions.map((sug) => (
                    <Command.Item 
                      key={sug}
                      onSelect={() => {
                        setInputValue(sug);
                        setOpen(false);
                        onSearchSubmit(sug);
                      }}
                      className="px-2 py-2 mt-1 rounded-md text-sm text-gray-800 cursor-pointer hover:bg-emerald-50 aria-selected:bg-emerald-50 aria-selected:text-emerald-700"
                    >
                      {sug}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {debouncedQ && isLoading && (
                <div className="py-6 text-center text-sm text-gray-500">
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full mr-2 align-middle"></div>
                  Searching...
                </div>
              )}

              {debouncedQ && !isLoading && !isError && data?.length === 0 && (
                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                  No schemes found for "{debouncedQ}"
                </Command.Empty>
              )}

              {debouncedQ && !isLoading && data?.length > 0 && (
                <Command.Group className="text-xs font-semibold text-gray-500">
                  <div className="p-2 pb-0">Schemes</div>
                  {data.map((scheme) => (
                    <Command.Item
                      key={scheme._id}
                      onSelect={() => navigate(`/schemes/${scheme._id}`)}
                      className="px-2 py-2 mt-1 rounded-md text-sm text-gray-800 cursor-pointer hover:bg-emerald-50 aria-selected:bg-emerald-50 aria-selected:text-emerald-700 flex flex-col"
                    >
                      <span className="font-medium">{highlightMatch(scheme.scheme_name, debouncedQ)}</span>
                      {scheme.schemeCategory && (
                        <span className="text-xs text-gray-500 mt-0.5">{scheme.schemeCategory}</span>
                      )}
                    </Command.Item>
                  ))}
                  
                  <Command.Item
                    onSelect={() => {
                      setOpen(false);
                      onSearchSubmit(inputValue);
                    }}
                    className="px-2 py-2 border-t border-gray-100 mt-1 rounded-md text-sm text-emerald-600 font-medium cursor-pointer hover:bg-emerald-50 aria-selected:bg-emerald-50"
                  >
                    View all results for "{debouncedQ}"
                  </Command.Item>
                </Command.Group>
              )}
            </Command.List>
          </div>
        )}
      </Command>
    </div>
  );
}
