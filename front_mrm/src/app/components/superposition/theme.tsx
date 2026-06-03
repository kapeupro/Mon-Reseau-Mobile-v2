import React, { useEffect } from 'react';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTranslations } from 'next-intl';

import ThemeItem from './themeitem';
import { useThemesStore } from '@/store/superposition';
import { useIsFirstMount } from '@/utils/useIsFirstMount';
import Action from './theme/action';
import { usePageStore } from '@/store/store';
import { isMobile } from '@/service/window';

export default function Themes() {
  const translations = useTranslations();
  const { themes, action, toggleProperty, reOrder } = useThemesStore();
  const bFirstMount = useIsFirstMount();
  const bIsMobile = isMobile();

  const toggleFiltered = (name: string) => {
    const { page: activePage } = usePageStore.getState();
    const aThemesToFiltered = themes.filter(
      (theme: any) => theme.name === name
    );

    if (
      aThemesToFiltered.length &&
      (aThemesToFiltered[0].bSuperposer ||
        aThemesToFiltered[0].name === activePage)
    ) {
      toggleProperty('bFiltered', name, 'filter');
    }
  };

  const toggleSuperposer = (name: string) => {
    toggleProperty('bSuperposer', name, 'superposer');
  };

  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    reOrder(result);
  };

  useEffect(() => {
    if (bFirstMount) return;

    const oAction = new Action(action, translations, bIsMobile);
    oAction.start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='droppable'>
        {(provided: any, snapshot: any) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {themes.map((theme: any, index: any) => (
              <Draggable
                key={theme.name}
                draggableId={theme.name}
                index={index}
              >
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className='mt-2'
                  >
                    <ThemeItem
                      key={theme.name}
                      {...theme}
                      toggleFiltered={toggleFiltered}
                      toggleSuperposer={toggleSuperposer}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
