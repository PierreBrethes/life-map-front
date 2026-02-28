import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Calendar, CheckSquare, Sparkles, Mic, Loader2 } from 'lucide-react';

import type { AgentMessage } from '../hooks/useAgentStream';

interface CommandPaletteHubProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentStream?: string;
  conversationHistory?: AgentMessage[];
  isStreaming?: boolean;
  onSendAgentMessage?: (msg: string) => void;
}

export function CommandPaletteHub({ isOpen, onOpenChange, currentStream, conversationHistory = [], isStreaming, onSendAgentMessage }: CommandPaletteHubProps) {
  const [inputValue, setInputValue] = useState('');

  // Keyboard shortcut listener for global toggle (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && onSendAgentMessage) {
      e.preventDefault();
      onSendAgentMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/90 backdrop-blur-3xl border-border shadow-2xl rounded-2xl sm:rounded-2xl">
        <DialogTitle className="sr-only">Taquito Command Palette</DialogTitle>
        <DialogDescription className="sr-only">Interface IA centrale pour contrôler votre LifeMap</DialogDescription>

        <div className="flex flex-col h-[70vh] max-h-[800px]">

          <ScrollArea className="flex-1 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Example Bento Widgets */}
              <div className="animate-in fade-in zoom-in-95 duration-700 delay-100 fill-mode-both">
                <Card className="bg-card/60 border-border/50 backdrop-blur-md hover:bg-card/80 transition-colors h-full shadow-lg">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b border-border/50">
                    <Calendar className="w-5 h-5 text-primary mr-3" />
                    <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground">AGENDA DU JOUR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 font-mono text-sm mt-5">
                      <div className="flex justify-between items-center group">
                        <span className="text-foreground/80 group-hover:text-foreground transition-colors">Revue du Sprint</span>
                        <span className="text-primary bg-primary/10 px-2 py-1 rounded">14:00</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-foreground/80 group-hover:text-foreground transition-colors">Facturation mensuelle</span>
                        <span className="text-primary bg-primary/10 px-2 py-1 rounded">16:30</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="animate-in fade-in zoom-in-95 duration-700 delay-200 fill-mode-both">
                <Card className="bg-card/60 border-border/50 backdrop-blur-md hover:bg-card/80 transition-colors h-full shadow-lg">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b border-border/50">
                    <CheckSquare className="w-5 h-5 text-primary mr-3" />
                    <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground">TÂCHES PRIORITAIRES</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 font-mono text-sm mt-5">
                      <label className="flex items-center space-x-4 cursor-pointer group">
                        <div className="w-5 h-5 border-2 border-muted-foreground/50 rounded flex-shrink-0 group-hover:border-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors text-foreground/80">Renouveler domaine .com</span>
                      </label>
                      <label className="flex items-center space-x-4 cursor-pointer group">
                        <div className="w-5 h-5 border-2 border-muted-foreground/50 rounded flex-shrink-0 group-hover:border-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors text-foreground/80">Appeler le comptable</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Response Area & History */}
              <div className="lg:col-span-2 space-y-4 pt-4 border-t border-border/50 mt-6">
                {conversationHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <Card className={`max-w-[80%] shadow-lg backdrop-blur-md ${msg.role === 'user' ? 'bg-primary/10 border-primary/20' : 'bg-card/60 border-border/50'}`}>
                      <CardContent className="p-4">
                        <div className="text-base leading-relaxed text-foreground/90 font-mono whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {(currentStream || isStreaming) && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                    <Card className="max-w-[80%] bg-card/60 border-border/50 backdrop-blur-md shadow-lg">
                      <CardContent className="p-4">
                        <div className="text-base leading-relaxed text-foreground/90 font-mono whitespace-pre-wrap">
                          {currentStream}
                          {isStreaming && <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" />}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

            </div>
          </ScrollArea>

          <div className="flex items-center border-t border-border/50 px-6 py-4 bg-muted/10">
            {isStreaming ? (
              <Loader2 className="w-6 h-6 text-primary mr-3 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 text-primary mr-3 animate-pulse opacity-80" />
            )}
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Que puis-je faire pour vous aujourd'hui ?"
              className="flex-1 bg-transparent text-xl text-foreground placeholder:text-muted-foreground/50 outline-none font-light tracking-wide placeholder:font-sans font-sans"
            />
            <button className="p-2 rounded-full hover:bg-muted-foreground/10 transition-colors ml-2">
              <Mic className="w-5 h-5 text-primary opacity-80" />
            </button>
          </div>

          {/* Footer Shortcuts */}
          <div className="border-t border-border/50 px-6 py-4 flex justify-between items-center text-xs text-muted-foreground bg-muted/30 font-sans">
            <div className="flex items-center space-x-2 opacity-70">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Taquito Online</span>
            </div>
            <div className="space-x-4">
              <span><kbd className="bg-muted-foreground/10 px-2 py-1 rounded-md text-[10px] font-mono mr-2">Enter</kbd> pour valider</span>
              <span><kbd className="bg-muted-foreground/10 px-2 py-1 rounded-md text-[10px] font-mono mr-2">Esc</kbd> pour fermer</span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
