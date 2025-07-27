/**
 * Utility functions for DOM manipulation
 */

export const waitForElement = (
  selector: string,
  timeout = 5000,
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

export const createElementWithClass = (
  tagName: string,
  className: string,
  innerHTML?: string,
): HTMLElement => {
  const element = document.createElement(tagName);
  element.className = className;
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  return element;
};

export const insertAfter = (newNode: Node, existingNode: Node): void => {
  existingNode.parentNode?.insertBefore(newNode, existingNode.nextSibling);
};

export const insertBefore = (newNode: Node, existingNode: Node): void => {
  existingNode.parentNode?.insertBefore(newNode, existingNode);
};

export const removeElement = (element: Element | null): void => {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
};

export const dispatchInputEvent = (
  element: HTMLInputElement | HTMLTextAreaElement,
): void => {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};
