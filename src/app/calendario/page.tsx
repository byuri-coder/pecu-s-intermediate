
'use client';

import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventClickArg } from "@fullcalendar/core";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
}

export default function CalendarPage() {
  const { user, loading: userLoading } = useUser();
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const { toast } = useToast();

  const carregarEventos = useCallback(async () => {
    if (!user) return;
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/calendario/get/${user.uid}`);
      const data = await res.json();
      if(data.eventos) {
          setEventos(
            data.eventos.map((ev: any) => ({
              id: ev._id,
              title: `${ev.titulo} (${ev.status})`,
              start: ev.data,
              backgroundColor: ev.status === "concluido" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              borderColor: ev.status === "concluido" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              textColor: ev.status === "concluido" ? "hsl(var(--primary-foreground))" : "hsl(var(--secondary-foreground))",
            }))
          );
      }
    } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar os eventos.", variant: "destructive" });
    } finally {
        setLoadingEvents(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      carregarEventos();
    }
    if (!user && !userLoading) {
        setLoadingEvents(false);
    }
  }, [user, userLoading, carregarEventos]);

  async function adicionarEvento(info: DateClickArg) {
    if (!user) return;
    const titulo = prompt("Título do evento:");
    if (!titulo) return;

    try {
        const res = await fetch("/api/calendario/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuarioId: user.uid,
                titulo,
                data: info.dateStr,
                status: 'pendente'
            }),
        });
        if (!res.ok) throw new Error("Falha ao salvar evento.");
        toast({ title: "Sucesso!", description: "Evento adicionado." });
        carregarEventos();
    } catch(error: any) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  }

  async function excluirEvento(clickInfo: EventClickArg) {
    if (confirm(`Tem certeza que deseja excluir o evento "${clickInfo.event.title}"?`)) {
      try {
          const res = await fetch(`/api/calendario/delete/${clickInfo.event.id}`, { method: "DELETE" });
          if(!res.ok) throw new Error("Falha ao excluir evento.");
          toast({ title: "Sucesso!", description: "Evento excluído." });
          carregarEventos();
      } catch(error: any) {
         toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <CalendarIcon className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-3xl font-bold font-headline">Calendário de Atividades</CardTitle>
                        <CardDescription>
                            Gerencie seus eventos, tarefas e prazos. Clique em um dia para adicionar um novo evento.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {userLoading || loadingEvents ? (
                     <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : user ? (
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={eventos}
                        dateClick={adicionarEvento}
                        eventClick={excluirEvento}
                        locale="pt-br"
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek,dayGridDay'
                        }}
                    />
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Faça login para visualizar seu calendário.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
