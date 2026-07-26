'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES, CATEGORIES, getServicesByCategory, sortServices } from '@/lib/landscape-config';

// Status colors for badges
const STATUS_COLORS: Record<string, string> = {
  Production: 'bg-green-500/20 text-green-400 border-green-500/30',
  Beta: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Development: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Deprecated: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  status: string;
  icon?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  tags: string[];
  version?: string;
  links?: Record<string, string>;
  dependsOn?: string[];
  maturity?: number;
  lastUpdated?: string;
}

export default function LandscapeVisualization() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('platform');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize filtered and sorted services
  const filteredServices = useMemo(() => {
    let services = SERVICES;
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      services = getServicesByCategory(selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      services = services.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Sort by status priority then alphabetically
    return sortServices(services);
  }, [selectedCategory, searchQuery]);

  // Calculate category counts including search results
  const categoryCounts = useMemo(() => {
    const allFiltered = searchQuery.trim() 
      ? SERVICES.filter(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : SERVICES;
    
    return CATEGORIES.map(cat => ({
      ...cat,
      count: allFiltered.filter(s => s.category === cat.id).length
    }));
  }, [searchQuery]);

  // Calculate total count for All Services button
  const allServicesCount = useMemo(() => {
    if (!searchQuery.trim()) return SERVICES.length;
    return SERVICES.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ).length;
  }, [searchQuery]);

  // Get stats

  return (
    <div className="landscape-container w-full max-w-7xl mx-auto px-4 py-4">
      {/* Quick Stats */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="bg-background-secondary rounded-lg px-6 py-3 border border-border/30">
          <div className="text-2xl font-bold text-foreground">{filteredServices.length}</div>
          <div className="text-sm text-muted-foreground">{selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : 'All Services'}</div>
        </div>
        <div className="bg-background-secondary rounded-lg px-6 py-3 border border-border/30">
          <div className="text-2xl font-bold text-green-400">
            {SERVICES.filter(s => s.status === 'Production').length}
          </div>
          <div className="text-sm text-muted-foreground">Production Ready</div>
        </div>
        <div className="bg-background-secondary rounded-lg px-6 py-3 border border-border/30">
          <div className="text-2xl font-bold text-amber-400">
            {SERVICES.filter(s => s.status === 'Beta').length}
          </div>
          <div className="text-sm text-muted-foreground">Beta Services</div>
        </div>
        <div className="bg-background-secondary rounded-lg px-6 py-3 border border-border/30">
          <div className="text-2xl font-bold text-purple-400">{CATEGORIES.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categoryCounts.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id === selectedCategory ? null : category.id);
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === category.id 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-background-secondary text-foreground hover:bg-background-tertiary border border-border/30'
            }`}
            style={{ borderColor: category.color + '40' }}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs bg-${category.color.replace('#', '')}/20 text-${category.color.replace('#', '')}`}>
              {category.count}
            </span>
          </motion.button>
        ))}
        
        <motion.button
          onClick={() => setSelectedCategory(null)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            selectedCategory === null 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
              : 'bg-background-secondary text-foreground hover:bg-background-tertiary border border-border/30'
          }`}
        >
          <span className="text-lg">🌐</span>
          <span>All Services</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
            {allServicesCount}
          </span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-muted-foreground">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-background-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-foreground"
        />
        {searchQuery && (
          <motion.button
            onClick={() => setSearchQuery('')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </motion.button>
        )}
      </div>

      {/* Results Info */}
      {searchQuery && (
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredServices.length} of {SERVICES.length} services
            {selectedCategory && ` in ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>
      )}

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => {
              const category = CATEGORIES.find(c => c.id === service.category);
              
              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className={`relative group cursor-pointer ${
                    hoveredService === service.id 
                      ? 'ring-2 ring-purple-500/50' 
                      : 'hover:ring-1 hover:ring-border/50'
                  }`}
                  onHoverStart={() => setHoveredService(service.id)}
                  onHoverEnd={() => setHoveredService(null)}
                  onClick={() => setSelectedService(service)}
                >
                  {/* Service Card */}
                  <div className="bg-background-secondary rounded-xl p-5 border border-border/30 h-full transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-500/10 group-hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{service.icon || category?.icon}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium`} 
                          style={{
                            backgroundColor: category?.color + '20',
                            color: category?.color
                          }}
                        >
                          {category?.name}
                        </span>
                      </div>
                      {service.isNew && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                          NEW
                        </span>
                      )}
                      {service.isFeatured && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                          ⭐
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.shortDescription || service.description}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/20">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[service.status] || 'border-border/30'}`}>
                        {service.status}
                      </span>
                      <div className="flex gap-1">
                        {service.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-border/20 rounded text-xs text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {service.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-border/20 rounded text-xs text-muted-foreground">
                            +{service.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground">Try a different search query or filter</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-background rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border/30 shadow-2xl shadow-purple-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-2xl">{selectedService.icon || '📦'}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedService.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[selectedService.status] || 'border-border/30'}`}>
                        {selectedService.status}
                      </span>
                      {selectedService.isNew && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                          NEW
                        </span>
                      )}
                      {selectedService.isFeatured && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedService(null)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background-secondary"
                  aria-label="Close modal"
                >
                  <span className="text-2xl">×</span>
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-foreground">
                    {selectedService.description}
                  </p>
                </div>

                {/* Version */}
                {selectedService.version && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Version
                    </h3>
                    <p className="text-foreground">{selectedService.version}</p>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Technical Details
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-background-secondary border border-border/30 rounded-full text-sm text-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                {selectedService.links && Object.keys(selectedService.links).length > 0 && (
                  <div className="pt-4 border-t border-border/20">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Quick Links
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedService.links.homepage && (
                        <a
                          href={selectedService.links.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                          <span>🌐</span>
                          <span>Homepage</span>
                        </a>
                      )}
                      {selectedService.links.documentation && (
                        <a
                          href={selectedService.links.documentation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-background-secondary hover:bg-background-tertiary text-foreground border border-border/30 rounded-lg transition-colors font-medium text-sm"
                        >
                          <span>📖</span>
                          <span>Documentation</span>
                        </a>
                      )}
                      {selectedService.links.repository && (
                        <a
                          href={selectedService.links.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-background-secondary hover:bg-background-tertiary text-foreground border border-border/30 rounded-lg transition-colors font-medium text-sm"
                        >
                          <span>💻</span>
                          <span>Repository</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {selectedService.dependsOn && selectedService.dependsOn.length > 0 && (
                  <div className="pt-4 border-t border-border/20">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Dependencies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.dependsOn.map((depId: string) => {
                        const depService = SERVICES.find(s => s.id === depId);
                        return depService ? (
                          <span 
                            key={depId} 
                            className="px-3 py-1 bg-background-secondary border border-border/30 rounded-full text-sm text-foreground"
                          >
                            {depService.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Maturity */}
                {selectedService.maturity !== undefined && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Maturity Level
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                            style={{ width: `${selectedService.maturity}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-12 text-right">
                          {selectedService.maturity}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedService.maturity >= 90 ? 'Production-ready with full support' :
                         selectedService.maturity >= 70 ? 'Stable with active development' :
                         'Under active development'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                {selectedService.lastUpdated && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Last Updated
                    </h3>
                    <p className="text-foreground text-sm">
                      {new Date(selectedService.lastUpdated).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
