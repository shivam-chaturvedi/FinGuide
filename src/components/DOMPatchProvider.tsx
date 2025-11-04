import { useEffect } from 'react';

// Patch the DOM removeChild method to handle errors gracefully
const patchRemoveChild = () => {
  const originalRemoveChild = Node.prototype.removeChild;
  
  Node.prototype.removeChild = function(child: Node) {
    try {
      // Check if the child is actually a child of this node
      if (child.parentNode === this) {
        return originalRemoveChild.call(this, child);
      } else {
        // If the child is not a child of this node, just return the child
        console.warn('Attempted to remove a node that is not a child of its parent:', child);
        return child;
      }
    } catch (error) {
      // If there's any error during removal, log it and return the child
      console.warn('Error removing child node:', error);
      return child;
    }
  };
};

// Patch the DOM remove method as well
const patchRemove = () => {
  const originalRemove = Element.prototype.remove;
  
  Element.prototype.remove = function() {
    try {
      if (this.parentNode) {
        return originalRemove.call(this);
      }
    } catch (error) {
      console.warn('Error removing element:', error);
    }
  };
};

// Component to apply DOM patches
export const DOMPatchProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Apply patches when component mounts
    patchRemoveChild();
    patchRemove();
    
    // Add global error handler for DOM manipulation errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error && event.error.message && 
          event.error.message.includes('removeChild') && 
          event.error.message.includes('not a child')) {
        console.warn('Caught DOM removeChild error, preventing crash:', event.error);
        event.preventDefault();
        return false;
      }
    };

    // Add global unhandled rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('removeChild') && 
          event.reason.message.includes('not a child')) {
        console.warn('Caught DOM removeChild promise rejection, preventing crash:', event.reason);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      // Note: We don't restore original methods as this could cause issues
      // The patches are safe and will remain active
    };
  }, []);

  return <>{children}</>;
};

export default DOMPatchProvider;
