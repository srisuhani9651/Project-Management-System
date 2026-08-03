import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Loader2, FolderKanban, CheckSquare, X, ArrowRight } from "lucide-react"
import api from "@/services/api"

/**
 * Text Highlighter Utility Component
 * Case-insensitively highlights matched query words/substrings.
 */
function HighlightText({ text, query }) {
  if (!text) return null
  if (!query || !query.trim()) return <span>{text}</span>

  const q = query.trim().toLowerCase()
  const lowerText = text.toLowerCase()
  const matchIndex = lowerText.indexOf(q)

  if (matchIndex === -1) {
    return <span>{text}</span>
  }

  const before = text.slice(0, matchIndex)
  const matched = text.slice(matchIndex, matchIndex + q.length)
  const after = text.slice(matchIndex + q.length)

  return (
    <span>
      {before}
      <mark className="bg-amber-400/30 text-amber-700 dark:text-amber-300 font-bold px-0.5 rounded">
        {matched}
      </mark>
      {after}
    </span>
  )
}

/**
 * GlobalSearch Component
 * Debounced top search bar with live database queries, PBAC compliance,
 * score ranking, text highlighting, and grouped Projects/Tasks dropdown navigation.
 */
export function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState({ projects: [], tasks: [] })
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchContainerRef = useRef(null)

  // 1. Debounce user typing by ~300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  // 2. Fetch live search results from backend whenever debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults({ projects: [], tasks: [] })
      setLoading(false)
      setIsOpen(false)
      return
    }

    let isMounted = true

    const fetchSearchResults = async () => {
      setLoading(true)
      try {
        const res = await api.get("/api/search", { params: { q: debouncedQuery } })
        if (isMounted) {
          setResults({
            projects: res.data?.projects || [],
            tasks: res.data?.tasks || [],
          })
          setIsOpen(true)
        }
      } catch (err) {
        console.warn("Global search fetch error:", err)
        if (isMounted) {
          setResults({ projects: [], tasks: [] })
          setIsOpen(true)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchSearchResults()

    return () => {
      isMounted = false
    }
  }, [debouncedQuery])

  // 3. Click outside & Escape key dismissal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleSelectProject = (projId) => {
    setIsOpen(false)
    setQuery("")
    navigate(`/projects/${projId}`)
  }

  const handleSelectTask = (taskId) => {
    setIsOpen(false)
    setQuery("")
    navigate(`/tasks/${taskId}`)
  }

  const hasProjects = results.projects && results.projects.length > 0
  const hasTasks = results.tasks && results.tasks.length > 0
  const noResults = !loading && debouncedQuery && !hasProjects && !hasTasks

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-md">
      
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        <input
          type="text"
          placeholder="Search projects, tasks, or keys..."
          value={query}
          onFocus={() => {
            if (debouncedQuery && (hasProjects || hasTasks || noResults)) {
              setIsOpen(true)
            }
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-roboto"
        />

        {/* Loading Spinner / Clear X Button */}
        <div className="absolute right-2.5 flex items-center">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setDebouncedQuery("")
                setIsOpen(false)
              }}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Grouped Results Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden max-h-[75vh] overflow-y-auto animate-fade-in font-roboto">
          
          {/* No Results Empty State */}
          {noResults && (
            <div className="p-6 text-center space-y-1.5">
              <p className="font-poppins font-semibold text-xs text-foreground">
                No matching projects or tasks found
              </p>
              <p className="text-[11px] text-muted-foreground">
                Try searching for a different project name, key, or task title.
              </p>
            </div>
          )}

          {/* Group 1: PROJECTS */}
          {hasProjects && (
            <div className="p-2 space-y-1 border-b border-border/50">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5 text-blue-600" />
                <span>Projects ({results.projects.length})</span>
              </div>

              {results.projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProject(proj.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-6 px-2 rounded-md bg-blue-500/10 text-blue-600 font-poppins font-bold text-[10px] flex items-center justify-center border border-blue-500/20 shrink-0">
                      <HighlightText text={proj.key} query={debouncedQuery} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-poppins text-xs font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                        <HighlightText text={proj.name} query={debouncedQuery} />
                      </h4>
                      {proj.description && (
                        <p className="text-[11px] text-muted-foreground truncate line-clamp-1">
                          <HighlightText text={proj.description} query={debouncedQuery} />
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}

          {/* Group 2: TASKS */}
          {hasTasks && (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tasks ({results.tasks.length})</span>
              </div>

              {results.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-poppins text-xs font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                        <HighlightText text={task.title} query={debouncedQuery} />
                      </h4>
                      {task.project_name && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          {task.project_name}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-muted-foreground truncate line-clamp-1">
                        <HighlightText text={task.description} query={debouncedQuery} />
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default GlobalSearch
