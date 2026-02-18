// SortFilter.js
import React, { useState, useMemo, useEffect } from 'react';
import { resourceTypes } from './Constants';

// Constants for better maintainability
const SORT_OPTIONS = [
  { value: "", label: "Default Order", icon: "📋" },
  { value: "scripture", label: "Scripture Order", icon: "📖" },
  { value: "alphabetical", label: "A-Z", icon: "🔤" },
  { value: "date", label: "Newest First", icon: "⏰" }
];

const PRICE_OPTIONS = ["Free", "Paid"];

const SortFilter = ({ 
  sortBy, 
  setSortBy, 
  filters, 
  setFilters, 
  toggleFilter, 
  availableAuthors = new Set(), // Default to empty Set if not provided
  customStyles = {} // Accept custom styles to override dark mode
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showResourceTypes, setShowResourceTypes] = useState(false);
  const [showAuthors, setShowAuthors] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [authorSearch, setAuthorSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Convert Set to Array and sort authors for better UX
  const authorsArray = useMemo(() => 
    Array.from(availableAuthors).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
    [availableAuthors]
  );

  // Memoized filtered authors for better performance
  const filteredAuthors = useMemo(() => 
    authorsArray.filter(author =>
      author.toLowerCase().includes(authorSearch.toLowerCase())
    ), [authorsArray, authorSearch]
  );

  const clearAllFilters = () => {
    setSortBy("");
    setFilters(prev => ({ 
      ...prev, 
      authors: new Set(), 
      types: new Set(),
      price: new Set()
    }));
  };

  const handlePriceToggle = (priceOption) => {
    const lowerPrice = priceOption.toLowerCase();
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Initialize price Set if it doesn't exist
      if (!newFilters.price) {
        newFilters.price = new Set();
      }
      
      // Create a new Set to ensure state updates properly
      const newPriceSet = new Set(newFilters.price);
      
      if (newPriceSet.has(lowerPrice)) {
        newPriceSet.delete(lowerPrice);
      } else {
        newPriceSet.add(lowerPrice);
      }
      
      newFilters.price = newPriceSet;
      return newFilters;
    });
  };

  const handleAuthorToggle = (author) => {
    if (author === "All Authors") {
      setFilters(prev => ({ ...prev, authors: new Set() }));
    } else {
      toggleFilter("authors", author);
    }
  };

  const handleTypeToggle = (type) => {
    if (type === "All Types") {
      setFilters(prev => ({ 
        ...prev, 
        types: new Set(resourceTypes.map((t) => t.toLowerCase()))
      }));
    } else {
      toggleFilter("types", type);
    }
  };

  const handleSortSelection = (value) => {
    setSortBy(value);
    setShowSortOptions(false);
  };

  const isAllAuthorsSelected = filters.authors?.size === 0;
  const isAllTypesSelected = filters.types?.size === resourceTypes.length;

  const renderArrow = (isExpanded) => (
    <span style={{
      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
      transition: "0.2s",
      color: "#000000" // Explicit black
    }}>
      ▼
    </span>
  );

  // Mobile styles with explicit colors
  const mobileStyles = {
    container: {
      marginBottom: "1.5rem"
    },
    dropdownButton: {
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "10px",
      border: "2px solid #e2e8f0",
      backgroundColor: "#ffffff", // Explicit white
      color: "#000000", // Explicit black
      fontSize: "1rem",
      fontWeight: "600",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    dropdownPanel: {
      marginTop: "0.75rem",
      padding: "0.75rem",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc", // Explicit light gray
      color: "#000000", // Explicit black
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    },
    sectionButton: (isExpanded) => ({
      width: "100%",
      padding: "0.6rem 0.8rem",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      backgroundColor: isExpanded ? "#e2e8f0" : "#ffffff", // Explicit white
      color: "#000000", // Explicit black
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "0.9rem",
      marginBottom: "0.5rem"
    }),
    buttonGrid: {
      marginTop: "0.5rem",
      display: "flex",
      gap: "0.4rem",
      flexWrap: "wrap"
    },
    filterButton: (isSelected, color = "#3b82f6") => ({
      padding: "0.4rem 0.6rem",
      borderRadius: "16px",
      border: `1px solid ${isSelected ? color : "#e2e8f0"}`,
      backgroundColor: isSelected ? color : "#ffffff", // Explicit white when not selected
      color: isSelected ? "#ffffff" : "#000000", // Explicit black when not selected
      fontWeight: "500",
      cursor: "pointer",
      fontSize: "0.8rem",
      whiteSpace: "nowrap"
    }),
    searchInput: {
      width: "100%",
      padding: "0.6rem",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff", // Explicit white
      color: "#000000", // Explicit black
      marginBottom: "0.5rem",
      outline: "none",
      boxSizing: "border-box",
      fontSize: "0.9rem"
    },
    clearButton: {
      padding: "0.5rem 0.8rem",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#ef4444",
      color: "#ffffff", // Explicit white
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "0.85rem"
    }
  };

  // Desktop styles with explicit colors
  const desktopStyles = {
    container: {
      marginBottom: "2rem"
    },
    dropdownButton: {
      width: "100%",
      padding: "1rem 1.5rem",
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      backgroundColor: "#ffffff", // Explicit white
      color: "#000000", // Explicit black
      fontSize: "1.1rem",
      fontWeight: "700",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      outline: "none",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    dropdownPanel: {
      marginTop: "1rem",
      padding: "1rem",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc", // Explicit light gray
      color: "#000000", // Explicit black
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
    },
    sectionButton: (isExpanded) => ({
      width: "100%",
      padding: "0.75rem 1rem",
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      backgroundColor: isExpanded ? "#e2e8f0" : "#ffffff", // Explicit white
      color: "#000000", // Explicit black
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      fontWeight: "600"
    }),
    buttonGrid: {
      marginTop: "0.5rem",
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap"
    },
    filterButton: (isSelected, color = "#3b82f6") => ({
      padding: "0.5rem 0.8rem",
      borderRadius: "20px",
      border: `2px solid ${isSelected ? color : "#e2e8f0"}`,
      backgroundColor: isSelected ? color : "#ffffff", // Explicit white when not selected
      color: isSelected ? "#ffffff" : "#000000", // Explicit black when not selected
      fontWeight: "500",
      cursor: "pointer"
    }),
    searchInput: {
      width: "100%",
      padding: "0.5rem 0.75rem",
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      backgroundColor: "#ffffff", // Explicit white
      color: "#000000", // Explicit black
      marginBottom: "0.5rem",
      outline: "none",
      boxSizing: "border-box",
      maxWidth: "100%"
    },
    clearButton: {
      padding: "0.5rem 1rem",
      borderRadius: "12px",
      border: "none",
      backgroundColor: "#ef4444",
      color: "#ffffff", // Explicit white
      cursor: "pointer",
      fontWeight: "600"
    }
  };

  const styles = isMobile ? mobileStyles : desktopStyles;

  return (
    <div style={styles.container}>
      {/* Main Dropdown Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.dropdownButton}
        aria-expanded={showDropdown}
        aria-label="Filter and sort options"
      >
        {isMobile ? "🔧 Filters" : "Filter & Sort"}
        {renderArrow(showDropdown)}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div style={styles.dropdownPanel}>
          {/* Sort Section */}
          <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              style={styles.sectionButton(showSortOptions)}
              aria-expanded={showSortOptions}
            >
              🔄 Sort Results
              <span style={{ color: "#000000" }}>{showSortOptions ? "▲" : "▼"}</span>
            </button>
            
            {showSortOptions && (
              <div style={styles.buttonGrid}>
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelection(option.value)}
                    style={styles.filterButton(sortBy === option.value)}
                    aria-pressed={sortBy === option.value}
                  >
                    {isMobile ? option.label.replace(" Order", "").replace(" First", "") : `${option.icon} ${option.label}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resource Types Section */}
          <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
            <button
              onClick={() => setShowResourceTypes(!showResourceTypes)}
              style={styles.sectionButton(showResourceTypes)}
              aria-expanded={showResourceTypes}
            >
              📚 {isMobile ? "Types" : "Resource Types"}
              <span style={{ color: "#000000" }}>{showResourceTypes ? "▲" : "▼"}</span>
            </button>
            
            {showResourceTypes && (
              <div style={styles.buttonGrid}>
                <button
                  onClick={() => handleTypeToggle("All Types")}
                  style={styles.filterButton(isAllTypesSelected, "#10b981")}
                  aria-pressed={isAllTypesSelected}
                >
                  All Types {isAllTypesSelected && "✓"}
                </button>
                {resourceTypes.map(type => {
                  const lowerType = type.toLowerCase();
                  const isSelected = filters.types?.has(lowerType);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter("types", lowerType)}
                      style={styles.filterButton(isSelected, "#10b981")}
                      aria-pressed={isSelected}
                    >
                      {type} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Price Section */}
          <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
            <button
              onClick={() => setShowPrice(!showPrice)}
              style={styles.sectionButton(showPrice)}
              aria-expanded={showPrice}
            >
              💲 Price
              <span style={{ color: "#000000" }}>{showPrice ? "▲" : "▼"}</span>
            </button>
            
            {showPrice && (
              <div style={styles.buttonGrid}>
                {PRICE_OPTIONS.map(priceOption => {
                  const lowerPrice = priceOption.toLowerCase();
                  const isSelected = filters.price?.has(lowerPrice) || false;
                  return (
                    <button
                      key={priceOption}
                      onClick={() => handlePriceToggle(priceOption)}
                      style={styles.filterButton(isSelected, "#f59e0b")}
                      aria-pressed={isSelected}
                    >
                      {priceOption} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Authors Section */}
          <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
            <button
              onClick={() => setShowAuthors(!showAuthors)}
              style={styles.sectionButton(showAuthors)}
              aria-expanded={showAuthors}
            >
              👥 Authors {!isMobile && `(${authorsArray.length} available)`}
              <span style={{ color: "#000000" }}>{showAuthors ? "▲" : "▼"}</span>
            </button>
            
            {showAuthors && (
              <div style={{ marginTop: "0.5rem" }}>
                {authorsArray.length === 0 ? (
                  <div style={{ 
                    padding: isMobile ? "0.75rem" : "1rem", 
                    textAlign: "center", 
                    color: "#666666", // Explicit gray
                    fontStyle: "italic",
                    fontSize: isMobile ? "0.85rem" : "1rem"
                  }}>
                    No authors found in database
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder={isMobile ? "🔍 Type to search..." : "🔍 Start typing to search authors..."}
                      value={authorSearch}
                      onChange={(e) => setAuthorSearch(e.target.value)}
                      style={styles.searchInput}
                      aria-label="Search authors"
                    />
                    <div style={styles.buttonGrid}>
                      <button
                        onClick={() => handleAuthorToggle("All Authors")}
                        style={styles.filterButton(isAllAuthorsSelected, "#8b5cf6")}
                        aria-pressed={isAllAuthorsSelected}
                      >
                        All Authors {isAllAuthorsSelected && "✓"}
                      </button>
                      {/* Only show authors when user is typing */}
                      {authorSearch.trim() && (
                        <>
                          {filteredAuthors.map(author => {
                            const isSelected = filters.authors?.has(author);
                            return (
                              <button
                                key={author}
                                onClick={() => handleAuthorToggle(author)}
                                style={styles.filterButton(isSelected, "#8b5cf6")}
                                aria-pressed={isSelected}
                              >
                                {author} {isSelected && "✓"}
                              </button>
                            );
                          })}
                          {filteredAuthors.length === 0 && (
                            <div style={{ 
                              padding: "0.5rem", 
                              color: "#666666", // Explicit gray
                              fontStyle: "italic",
                              fontSize: isMobile ? "0.8rem" : "0.9rem"
                            }}>
                              No authors found matching "{authorSearch}"
                            </div>
                          )}
                        </>
                      )}
                      {/* Show hint when not typing */}
                      {!authorSearch.trim() && (
                        <div style={{ 
                          padding: "0.5rem", 
                          color: "#888888", // Explicit light gray
                          fontStyle: "italic",
                          fontSize: isMobile ? "0.8rem" : "0.9rem"
                        }}>
                          {isMobile ? "Type to see authors..." : "Start typing to see available authors..."}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Clear All Button */}
          <div style={{ marginTop: isMobile ? "0.75rem" : "1rem", textAlign: "right" }}>
            <button
              onClick={clearAllFilters}
              style={styles.clearButton}
              aria-label="Clear all filters"
            >
              🗑️ {isMobile ? "Clear" : "Clear All"}
            </button>
          </div>
        </div>
      )}
      
      {/* Separator Line */}
      <div style={{
        width: "100%",
        height: "1px",
        background: "linear-gradient(90deg, transparent, #000000 20%, #000000 80%, transparent)",
        marginTop: isMobile ? "1.5rem" : "2rem",
        marginBottom: isMobile ? "1rem" : "1.5rem"
      }} />
    </div>
  );
};

export default SortFilter;