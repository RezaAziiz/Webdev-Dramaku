import React, { useCallback, useEffect, useRef, useState } from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";

const SelectMenu = ({
  className = "",
  ariaLabel,
  value,
  options,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const listId = useRef(
    `ui-select-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const selectedOption = options.find(
    (option) => String(option.value) === String(value),
  );
  const triggerLabel =
    (selectedOption || options[0] || {}).label || ariaLabel || "";

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const frame = requestAnimationFrame(() => {
      listRef.current
        ?.querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return undefined;
    const frame = requestAnimationFrame(() => {
      listRef.current
        ?.querySelectorAll('[role="option"]')
        ?.[activeIndex]?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeIndex, isOpen]);

  const openMenu = useCallback(() => {
    const index = options.findIndex(
      (option) => String(option.value) === String(value),
    );
    setActiveIndex(index >= 0 ? index : 0);
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 240 && rect.top > 240);
    }
    setIsOpen(true);
  }, [options, value]);

  const closeMenu = useCallback((shouldFocusTrigger) => {
    setIsOpen(false);
    if (shouldFocusTrigger) triggerRef.current?.focus();
  }, []);

  const chooseOption = useCallback(
    (option) => {
      if (!option) return;
      setIsOpen(false);
      triggerRef.current?.focus();
      onChange(option.value);
    },
    [onChange],
  );

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => {
        const total = options.length;
        if (!total) return -1;
        const next = event.key === "ArrowDown" ? prev + 1 : prev - 1;
        return (next + total) % total;
      });
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(options.length ? 0 : -1);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseOption(options[activeIndex]);
      return;
    }
    if (event.key === "Tab") {
      closeMenu(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`ui-select${isOpen ? " is-open" : ""}${dropUp ? " is-dropup" : ""}${className ? ` ${className}` : ""}`}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className="ui-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-label={ariaLabel}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (isOpen ? closeMenu(false) : openMenu())}
      >
        <span className="ui-select-value">{triggerLabel}</span>
        <LuChevronDown aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          ref={listRef}
          id={listId}
          className="ui-select-menu"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option, index) => {
            const isSelected =
              selectedOption &&
              String(option.value) === String(selectedOption.value);
            const key = option.key || `${String(option.value)}-${index}`;
            return (
              <div
                className={`ui-select-option${isSelected ? " is-selected" : ""}${index === activeIndex ? " is-active" : ""}`}
                id={`${listId}-${index}`}
                key={key}
                role="option"
                aria-selected={Boolean(isSelected)}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => chooseOption(option)}
              >
                <span>{option.label}</span>
                {isSelected && <LuCheck aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectMenu;
