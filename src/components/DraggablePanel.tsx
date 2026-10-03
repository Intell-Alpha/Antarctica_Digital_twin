"use client";

import React, { useState, useRef, ReactNode } from "react";

let globalPanelZIndex = 50;

interface DraggablePanelProps {
  children: ReactNode;
  className?: string;
  defaultPosition?: { x: number; y: number };
  disabled?: boolean;
}

export function DraggablePanel({
  children,
  className = "",
  defaultPosition = { x: 0, y: 0 },
  disabled = false,
}: DraggablePanelProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(globalPanelZIndex);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; initX: number; initY: number }>({
    pointerX: 0,
    pointerY: 0,
    initX: 0,
    initY: 0,
  });

  const bringToFront = () => {
    globalPanelZIndex += 1;
    setZIndex(globalPanelZIndex);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;

    bringToFront();

    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("a") ||
      target.closest("[data-no-drag]") ||
      target.closest(".no-drag") ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    if (e.button !== 0) return;

    e.stopPropagation();

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      initX: position.x,
      initY: position.y,
    };

    setIsDragging(true);

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;

    e.preventDefault();

    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;

    let newX = dragStartRef.current.initX + deltaX;
    let newY = dragStartRef.current.initY + deltaY;

    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const minVisibleWidth = 80;
      const minVisibleHeight = 40;

      const minX = -rect.left + position.x - rect.width + minVisibleWidth;
      const maxX = vw - rect.left + position.x - minVisibleWidth;
      newX = Math.max(minX, Math.min(maxX, newX));

      const minY = -rect.top + position.y;
      const maxY = vh - rect.top + position.y - minVisibleHeight;
      newY = Math.max(minY, Math.min(maxY, newY));
    }

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      if (e.currentTarget.releasePointerCapture) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {
          // Fallback
        }
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("a") ||
      target.closest("[data-no-drag]") ||
      target.closest(".no-drag") ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    // Double click to snap back to initial position
    setPosition(defaultPosition);
  };

  const isPositioned = className.includes("fixed") || className.includes("absolute") || className.includes("sticky");
  const positionClass = isPositioned ? "" : "relative";

  return (
    <div
      ref={panelRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        zIndex,
        transition: isDragging ? "none" : "transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`${positionClass} pointer-events-auto select-none ${
        disabled
          ? ""
          : isDragging
          ? "cursor-grabbing opacity-95 shadow-2xl scale-[1.01]"
          : "cursor-grab"
      } ${className}`}
      title={disabled ? "" : "Click & drag anywhere on panel to move · Double-click to reset position"}
    >
      {children}
    </div>
  );
}


