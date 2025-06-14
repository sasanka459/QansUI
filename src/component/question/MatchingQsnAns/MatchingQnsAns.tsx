/**
 * The `MatchingQnsAns` component provides a drag-and-drop interface for matching Azure services to their correct descriptions.
 * 
 * Users can drag descriptions onto service items to create matches, remove matches, and reset all matches to start over.
 * The component uses React DnD for drag-and-drop functionality and maintains internal state for matched and unmatched items.
 *
 * @component
 * @returns {JSX.Element} The rendered matching question and answer interface.
 */
import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './MatchingQnsAns.module.css';

// interface define the structure of the Service
interface Service {
  id: number;
  name: string;
  matchedDescriptionId: number | null;
}

// interface define the structure of the Descriptions
interface Description {
  id: number;
  text: string;
  correctServiceId: number;
}

//Hardcoded list of services with initial state  and descriptions with their corresponding correct service matches
const services: Service[] = [
  { id: 1, name: 'Azure Key Vault', matchedDescriptionId: null },
  { id: 2, name: 'Azure App Service', matchedDescriptionId: null },
  { id: 3, name: 'Azure Virtual Machines', matchedDescriptionId: null },
  { id: 4, name: 'Azure Blob Storage', matchedDescriptionId: null },
  { id: 5, name: 'Azure Cosmos DB', matchedDescriptionId: null },
  { id: 6, name: 'Azure Functions', matchedDescriptionId: null },
];

const descriptions: Description[] = [
  { id: 1, text: 'Enterprise-grade security for identities', correctServiceId: 0 },
  { id: 2, text: 'Host and scale web applications', correctServiceId: 2 },
  { id: 3, text: 'Event-driven serverless compute platform', correctServiceId: 6 },
  { id: 4, text: 'Securely store secrets and certificates', correctServiceId: 1 },
  { id: 5, text: 'Run virtualized operating systems', correctServiceId: 3 },
  { id: 6, text: 'Store unstructured data like images and videos', correctServiceId: 4 },
  { id: 7, text: 'Globally distributed, multi-model database service', correctServiceId: 5 },
];

/**  ServiceItem is a component that represents a single Azure service row.
* It acts as a drop target for draggable descriptions using React DnD.
* If a description is matched, it displays the matched description with a remove(x) button.
* Props:
* - service: the Azure service object
* - matchedDescription: the currently matched description (if any)
* - onDrop: callback when a description is dropped onto this service
* - onRemove: callback to remove the matched description from this service
**/
const ServiceItem = ({
  service,
  matchedDescription,
  onDrop,
  onRemove,
  showResults,
  canDrop,
}: {
  service: Service;
  matchedDescription: Description | null;
  onDrop: (serviceId: number, descriptionId: number) => void;
  onRemove: (descriptionId: number) => void;
  showResults: boolean;
  canDrop: boolean;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'description',
    drop: (item: { id: number }) => {
      onDrop(service.id, item.id);
    },
    canDrop: () => canDrop,
    collect: (monitor) => ({
      isOver: canDrop && !!monitor.isOver(),
    }),
  }));

  const isCorrect = matchedDescription 
    ? matchedDescription.correctServiceId === service.id
    : false;

  return (
    <div
      ref={drop}
      className={`${styles.serviceItem} ${isOver ? styles.serviceItemOver : ''} ${
        showResults && matchedDescription ? (isCorrect ? styles.correctMatch : styles.incorrectMatch) : ''
      }`}
    >
      <div className={styles.serviceName}>{service.name}</div>
      {matchedDescription && (
        <DraggableDescription 
          description={matchedDescription} 
          isMatched={true}
          isCorrect={isCorrect}
          showResults={showResults}
          onRemove={() => onRemove(matchedDescription.id)}
        />
      )}
    </div>
  );
};

/**  DraggableDescription is a draggable component for descriptions using React DnD.
* Props:
* - description: the description object to display
* - isMatched: whether this description is currently matched to a service
* - isCorrect: whether the match is correct (for styling)
* - onRemove: callback to remove the matched description (shows a remove button if matched)
**/
const DraggableDescription = ({ 
  description, 
  isMatched = false, 
  isCorrect = true,
  showResults = false,
  onRemove
}: { 
  description: Description;
  isMatched?: boolean;
  isCorrect?: boolean;
  showResults?: boolean;
  onRemove?: () => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'description',
    item: { id: description.id },
    canDrag: !showResults && !isMatched,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

    /** Handles the remove (×) button click for matched descriptions.
  * Stops event propagation and calls the onRemove callback if provided.
  **/
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <div
      ref={drag}
      className={`${styles.description} ${isDragging ? styles.descriptionDragging : ''} ${
        showResults && !isCorrect ? styles.descriptionIncorrect : ''
      } ${showResults && isCorrect ? styles.descriptionCorrect : ''}`}
    >
      {description.text}
      {isMatched && !showResults && (
        <button 
          onClick={handleRemove}
          className={styles.removeButton}
        >
          ×
        </button>
      )}
      {showResults && (
        <span className={styles.resultIndicator}>
          {isCorrect ? '✓' : '✗'}
        </span>
      )}
    </div>
  );
};

/**
 * MatchingQnsAns is the main component that manages the drag-and-drop matching logic and UI.
 * It maintains state for matched services and unmatched descriptions, and renders the interface.
 * Handles dropping, removing, and resetting matches.
 */
export default function MatchingQnsAns() {
  const [servicesState, setServicesState] = useState<Service[]>(services);
  const [unmatchedDescriptions, setUnmatchedDescriptions] = useState<Description[]>(descriptions);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

    /**
   * Handles dropping a description onto a service.
   * Updates the matched service and removes the description from the unmatched list.
   */
  const handleDrop = (serviceId: number, descriptionId: number) => {
    const previouslyMatchedServiceIndex = servicesState.findIndex(
      (s) => s.matchedDescriptionId === descriptionId
    );

    setServicesState(prev => {
      const newState = [...prev];
      
      if (previouslyMatchedServiceIndex >= 0) {
        newState[previouslyMatchedServiceIndex].matchedDescriptionId = null;
      }
      
      const serviceIndex = newState.findIndex(s => s.id === serviceId);
      newState[serviceIndex].matchedDescriptionId = descriptionId;
      
      return newState;
    });

    setUnmatchedDescriptions(prev => prev.filter(d => d.id !== descriptionId));
  };

    /**
   * Handles removing a matched description from a service.
   * Unmatches the description and returns it to the unmatched list.
   */
  const handleRemoveDescription = (descriptionId: number) => {
    setServicesState(prev => {
      const newState = [...prev];
      const serviceIndex = newState.findIndex(s => s.matchedDescriptionId === descriptionId);
      if (serviceIndex >= 0) {
        newState[serviceIndex].matchedDescriptionId = null;
      }
      return newState;
    });

    const description = descriptions.find(d => d.id === descriptionId);
    if (description) {
      setUnmatchedDescriptions(prev => [...prev, description]);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    setIsSubmitted(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <h1 className={styles.header}>Match Azure Services with Descriptions</h1>
        
        <div className={styles.columnsContainer}>
          <div className={styles.column}>
            <h2 className={styles.sectionHeader}>Azure Services</h2>
            {servicesState.map(service => {
              const matchedDescription = descriptions.find(
                d => d.id === service.matchedDescriptionId
              );
              return (
                <ServiceItem 
                  key={service.id}
                  service={service}
                  matchedDescription={matchedDescription || null}
                  onDrop={handleDrop}
                  onRemove={handleRemoveDescription}
                  showResults={showResults}
                  canDrop={!service.matchedDescriptionId && !isSubmitted}
                />
              );
            })}
          </div>

          <div className={styles.column}>
            <h2 className={styles.sectionHeader}>Descriptions</h2>
            {unmatchedDescriptions.map(description => (
              <DraggableDescription 
                key={description.id} 
                description={description} 
                showResults={showResults}
              />
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            onClick={handleSubmit}
            className={styles.submitButton}
            //disabled={isSubmitted || unmatchedDescriptions.length === descriptions.length}
          >
            {isSubmitted ? 'Submitted' : 'Submit'}
          </button>
        </div>
      </div>
    </DndProvider>
  );
}