import { useState, useEffect, useCallback } from "react"
import { Bookmark, Trash2, Upload, Pencil, Check, X } from "lucide-react"
import { getPresets, deletePreset, renamePreset } from "@/data/store"
import type { CalculatorState, SavedPreset } from "@/data/types"

interface Props {
  userEmail: string
  onLoadPreset: (state: CalculatorState) => void
  refreshKey?: number
}

export function SavedPresets({ userEmail, onLoadPreset, refreshKey }: Props) {
  const [presets, setPresets] = useState<SavedPreset[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const refresh = useCallback(() => {
    setPresets(getPresets(userEmail))
  }, [userEmail])

  useEffect(() => {
    refresh()
  }, [refresh, refreshKey])

  const handleDelete = (id: string) => {
    deletePreset(userEmail, id)
    refresh()
  }

  const handleRename = (id: string) => {
    if (!editName.trim()) return
    renamePreset(userEmail, id, editName.trim())
    setEditingId(null)
    setEditName("")
    refresh()
  }

  const handleLoad = (preset: SavedPreset) => {
    onLoadPreset(preset.state)
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
        <Bookmark size={12} />
        常用方案
      </h3>

      {/* Presets list */}
      {presets.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          暂无保存的方案
        </p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="group flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-smooth"
            >
              {editingId === preset.id ? (
                <div className="flex-1 flex gap-1 min-w-0">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(preset.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    className="flex-1 min-w-0 px-1.5 py-0.5 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button onClick={() => handleRename(preset.id)} className="p-0.5 text-primary">
                    <Check size={11} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-0.5 text-muted-foreground">
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{preset.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(preset.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-smooth">
                    <button
                      onClick={() => handleLoad(preset)}
                      className="p-1 rounded hover:bg-primary/10 text-primary"
                      title="加载方案"
                    >
                      <Upload size={11} />
                    </button>
                    <button
                      onClick={() => { setEditingId(preset.id); setEditName(preset.name) }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground"
                      title="重命名"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(preset.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive"
                      title="删除"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
