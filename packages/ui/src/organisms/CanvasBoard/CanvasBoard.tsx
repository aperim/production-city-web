'use client';

import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { cn } from '../../lib/utils';

export interface BoardLane {
  id: string;
  label: string;
  wipLimit?: number;
}

export interface BoardCard {
  id: string;
  laneId: string;
  title: string;
  subtitle?: string;
  assignee?: string;
}

export interface CanvasBoardProps {
  /** Lane definitions */
  lanes: BoardLane[];
  /** Card data */
  cards: BoardCard[];
  /** Called when a card is moved to a new lane */
  onCardMove: (cardId: string, fromLaneId: string, toLaneId: string) => void;
  /** Called when a card is clicked */
  onCardClick?: (cardId: string) => void;
  /** Custom className */
  className?: string;
}

function DraggableCard({
  card,
  onCardClick,
}: {
  card: BoardCard;
  onCardClick?: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      onClick={() => onCardClick?.(card.id)}
      className={cn(
        'flex flex-col gap-0.5 rounded-md border bg-background p-2.5 text-left cursor-grab hover:border-foreground/20 transition-colors',
        isDragging && 'opacity-50',
      )}
    >
      <span className="text-sm font-medium text-foreground">{card.title}</span>
      {card.subtitle && (
        <span className="text-xs text-muted-foreground">{card.subtitle}</span>
      )}
      {card.assignee && (
        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
          {card.assignee}
        </span>
      )}
    </div>
  );
}

function DroppableLane({
  lane,
  cards,
  onCardClick,
}: {
  lane: BoardLane;
  cards: BoardCard[];
  onCardClick?: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: lane.id });
  const count = cards.length;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-2 min-w-[260px] max-w-[300px] flex-1',
        'rounded-md border bg-muted/30 p-3',
        isOver && 'border-primary/50 bg-muted/50',
      )}
    >
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-sm font-medium text-foreground">{lane.label}</span>
        <span className="text-xs text-muted-foreground">
          {count}{lane.wipLimit ? `/${lane.wipLimit}` : ''}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 min-h-[40px]">
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Kanban board with drag-and-drop between lanes via @dnd-kit.
 */
export function CanvasBoard({
  lanes,
  cards,
  onCardMove,
  onCardClick,
  className,
}: CanvasBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const activeCard = cards.find((c) => c.id === activeId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    const card = cards.find((c) => c.id === id);
    if (card) {
      setAnnouncement(`Picked up ${card.title}`);
    }
  }, [cards]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      setAnnouncement('Cancelled');
      return;
    }

    const cardId = String(active.id);
    const toLaneId = String(over.id);
    const card = cards.find((c) => c.id === cardId);

    if (card && card.laneId !== toLaneId) {
      const toLane = lanes.find((l) => l.id === toLaneId);
      onCardMove(cardId, card.laneId, toLaneId);
      setAnnouncement(`Moved ${card.title} to ${toLane?.label ?? toLaneId}`);
    } else {
      setAnnouncement('Dropped in same lane');
    }
  }, [cards, lanes, onCardMove]);

  return (
    <div className={cn('flex gap-3 overflow-x-auto p-1', className)}>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {lanes.map((lane) => (
          <DroppableLane
            key={lane.id}
            lane={lane}
            cards={cards.filter((c) => c.laneId === lane.id)}
            onCardClick={onCardClick}
          />
        ))}
        <DragOverlay>
          {activeCard && (
            <div className="flex flex-col gap-0.5 rounded-md border bg-background p-2.5 shadow-sm opacity-90 w-[260px]">
              <span className="text-sm font-medium text-foreground">{activeCard.title}</span>
              {activeCard.subtitle && (
                <span className="text-xs text-muted-foreground">{activeCard.subtitle}</span>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
