// src/screens/IdeasScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save } from '../store';
import type { AppState, Idea, Recipe } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

// Curated baseline ideas (same as web version)
const CURATED: Idea[] = [
  {
    id: "cur-uhpc-panel",
    title: "UHPC facade panel",
    process: "UHPC",
    summary: "Thin high-strength facade with ~2% steel fibers; start w/b≈0.19.",
    densityKgM3: 2350,
    lines: [
      { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
      { materialName: "Silica fume", amount: 0.25, unit: "ratio" },
      { materialName: "Sand (0–2 mm)", amount: 1.1, unit: "ratio" },
      { materialName: "Water", amount: 0.19, unit: "ratio" },
      { materialName: "PCE Superplasticizer (product)", amount: 0.015, unit: "ratio" },
      { materialName: "Steel fibers", amount: 0.02, unit: "ratio" },
    ],
    tags: ["panel","exterior","thin","SCC/hand-packed"],
    source: "curated",
    createdAt: "2025-01-01T00:00:00.000Z",
    bookmarked: false,
  },
  {
    id: "cur-gfrc-tile",
    title: "GFRC decorative wall tile",
    process: "GFRC_BACK",
    summary: "Backer with AR glass; tune fiber 3–5% for stiffness.",
    densityKgM3: 2200,
    lines: [
      { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
      { materialName: "Silica fume", amount: 0.2, unit: "ratio" },
      { materialName: "Sand (0–2 mm)", amount: 1.6, unit: "ratio" },
      { materialName: "Water", amount: 0.33, unit: "ratio" },
      { materialName: "PCE Superplasticizer (product)", amount: 0.006, unit: "ratio" },
      { materialName: "AR Glass fibers (chopped)", amount: 0.05, unit: "ratio" },
    ],
    tags: ["tile","gfrc","backer"],
    source: "curated",
    createdAt: "2025-01-01T00:00:00.000Z",
    bookmarked: false,
  },
  {
    id: "cur-scc-slab",
    title: "SCC cast-in-place slab",
    process: "SCC",
    summary: "Pumpable SCC; target slump-flow 650–700 mm in trials.",
    densityKgM3: 2400,
    lines: [
      { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
      { materialName: "Fly ash (Class F)", amount: 0.20, unit: "ratio" },
      { materialName: "Limestone powder", amount: 0.10, unit: "ratio" },
      { materialName: "Sand (0–2 mm)", amount: 1.90, unit: "ratio" },
      { materialName: "Coarse 5–10 mm", amount: 0.80, unit: "ratio" },
      { materialName: "Coarse 10–20 mm", amount: 0.80, unit: "ratio" },
      { materialName: "Water", amount: 0.32, unit: "ratio" },
      { materialName: "PCE Superplasticizer (product)", amount: 0.010, unit: "ratio" },
    ],
    tags: ["slab","pump","flow"],
    source: "curated",
    createdAt: "2025-01-01T00:00:00.000Z",
    bookmarked: false,
  },
];

export default function IdeasScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appState = await load();
        // Seed curated ideas if empty
        if (!appState.ideas || appState.ideas.filter(i => i.source === "curated").length === 0) {
          appState.ideas = [...CURATED, ...(appState.ideas || [])];
          await save(appState);
        }
        setState(appState);
      } catch (error) {
        console.error('Failed to load app state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const curated = useMemo(() => 
    state?.ideas?.filter(i => i.source === "curated") || [], 
    [state?.ideas]
  );
  
  const feed = useMemo(() => 
    state?.ideas?.filter(i => i.source === "ai").sort((a, b) => 
      b.createdAt.localeCompare(a.createdAt)
    ) || [], 
    [state?.ideas]
  );

  const saveIdeas = async (next: Idea[]) => {
    if (!state) return;
    const nextState = { ...state, ideas: next };
    setState(nextState);
    await save(nextState);
  };

  const getFreshIdeas = async (count = 3) => {
    try {
      setAiLoading(true);
      // For now, create some mock AI ideas since we don't have the AI service
      const mockIdeas: Idea[] = [
        {
          id: `ai-${Date.now()}-1`,
          title: "High-strength decorative concrete",
          process: "UHPC",
          summary: "AI-generated idea for decorative concrete with enhanced strength properties.",
          densityKgM3: 2400,
          lines: [
            { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
            { materialName: "Silica fume", amount: 0.15, unit: "ratio" },
            { materialName: "Sand (0–2 mm)", amount: 1.2, unit: "ratio" },
            { materialName: "Water", amount: 0.25, unit: "ratio" },
          ],
          tags: ["decorative", "high-strength"],
          source: "ai",
          createdAt: new Date().toISOString(),
          bookmarked: false,
        },
        {
          id: `ai-${Date.now()}-2`,
          title: "Lightweight structural concrete",
          process: "SCC",
          summary: "AI-suggested lightweight concrete for structural applications.",
          densityKgM3: 2000,
          lines: [
            { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
            { materialName: "Lightweight aggregate", amount: 0.8, unit: "ratio" },
            { materialName: "Water", amount: 0.35, unit: "ratio" },
          ],
          tags: ["lightweight", "structural"],
          source: "ai",
          createdAt: new Date().toISOString(),
          bookmarked: false,
        },
      ];
      
      const existingTitles = new Set(state?.ideas?.map(i => i.title.toLowerCase()) || []);
      const unique = mockIdeas.filter(idea => !existingTitles.has(idea.title.toLowerCase()));
      
      if (unique.length > 0) {
        await saveIdeas([...unique, ...(state?.ideas || [])]);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const toggleBookmark = async (idStr: string) => {
    if (!state?.ideas) return;
    const updated = state.ideas.map(x => 
      x.id === idStr ? { ...x, bookmarked: !x.bookmarked } : x
    );
    await saveIdeas(updated);
  };

  const dismissIdea = async (idStr: string) => {
    Alert.alert(
      'Remove Idea',
      'Remove this idea from the feed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!state?.ideas) return;
            const updated = state.ideas.filter(x => x.id !== idStr);
            await saveIdeas(updated);
          },
        },
      ]
    );
  };

  const addAsRecipe = async (idea: Idea) => {
    if (!state) return;
    
    // Map material names to IDs (create if missing)
    const mats = [...state.materials];
    const findOrCreate = (name: string): string => {
      const exist = mats.find(m => m.name === name);
      if (exist) return exist.id;
      const m = { 
        id: Math.random().toString(36).slice(2, 10), 
        name,
        unit: 'kg',
        costPerUnitIDR: 1000,
        updatedAt: new Date().toISOString()
      } as any;
      mats.push(m);
      return m.id;
    };

    const recipe: Recipe = {
      id: Math.random().toString(36).slice(2, 10),
      name: `${idea.title} (Idea)`,
      process: idea.process,
      version: "v0.1",
      densityKgM3: idea.densityKgM3,
      lines: idea.lines.map(l => ({
        id: Math.random().toString(36).slice(2, 10),
        materialId: findOrCreate(l.materialName),
        amount: l.amount,
        unit: l.unit
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: idea.tags,
    };

    const nextState = { ...state, materials: mats, recipes: [recipe, ...state.recipes] };
    setState(nextState);
    await save(nextState);
    Alert.alert('Success', `Added to Recipes: ${recipe.name}`);
  };

  const renderIdea = ({ item }: { item: Idea }) => (
    <Card style={styles.ideaCard}>
      <View style={styles.ideaHeader}>
        <View style={styles.ideaIconContainer}>
          <Ionicons name="bulb-outline" size={20} color="#ff9800" />
        </View>
        <View style={styles.ideaInfo}>
          <Text style={[styles.ideaTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <View style={styles.ideaMeta}>
            <View style={[styles.sourceBadge, { backgroundColor: item.source === 'ai' ? colors.primary + '20' : colors.success + '20' }]}>
              <Text style={[styles.sourceText, { color: item.source === 'ai' ? colors.primary : colors.success }]}>
                {item.source === 'ai' ? 'AI' : 'Curated'}
              </Text>
            </View>
            <View style={[styles.processBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.processText, { color: colors.textSecondary }]}>
                {item.process}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <Text style={[styles.ideaSummary, { color: colors.textSecondary }]}>
        {item.summary}
      </Text>
      
      {item.densityKgM3 && (
        <Text style={[styles.densityText, { color: colors.textSecondary }]}>
          Baseline density: {item.densityKgM3} kg/m³
        </Text>
      )}
      
      <View style={styles.ingredientsSection}>
        <Text style={[styles.ingredientsTitle, { color: colors.textSecondary }]}>
          Ingredients (ratio unless noted):
        </Text>
        {item.lines.map((line, index) => (
          <Text key={index} style={[styles.ingredientItem, { color: colors.text }]}>
            • {line.materialName} — {line.amount} {line.unit}
          </Text>
        ))}
      </View>
      
      <View style={styles.ideaFooter}>
        <View style={styles.tagsContainer}>
          {item.tags && item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.updatedAt, { color: colors.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { 
            backgroundColor: item.bookmarked ? colors.primary : colors.surface,
            borderColor: colors.border 
          }]}
          onPress={() => toggleBookmark(item.id)}
        >
          <Ionicons 
            name={item.bookmarked ? "bookmark" : "bookmark-outline"} 
            size={16} 
            color={item.bookmarked ? colors.background : colors.primary} 
          />
          <Text style={[styles.actionButtonText, { 
            color: item.bookmarked ? colors.background : colors.primary 
          }]}>
            {item.bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => addAsRecipe(item)}
        >
          <Ionicons name="add-circle-outline" size={16} color={colors.success} />
          <Text style={[styles.actionButtonText, { color: colors.success }]}>
            Add as recipe
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
          onPress={() => dismissIdea(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading ideas...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load ideas
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.surface, 
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top + 8, 20)
        }
      ]}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="bulb-outline" size={24} color="#ff9800" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Ideas & Starters
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Explore curated baseline recipes and AI-generated suggestions. Promote any idea into a full recipe.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => getFreshIdeas(3)}
          style={[styles.getFreshButton, { backgroundColor: colors.primary }]}
          disabled={aiLoading}
        >
          <Ionicons name="flash" size={20} color={colors.background} />
          <Text style={[styles.getFreshButtonText, { color: colors.background }]}>
            {aiLoading ? 'Fetching…' : 'Get Fresh Ideas'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Research & Testing Section */}
      <View style={styles.researchSection}>
        <Card style={styles.researchCard}>
          <Text style={[styles.researchTitle, { color: colors.text }]}>
            Research & Testing
          </Text>
          <View style={styles.researchItems}>
            <TouchableOpacity
              style={[styles.researchItem, { backgroundColor: colors.success + '20' }]}
              onPress={() => navigation.navigate('LabList')}
            >
              <Ionicons name="beaker-outline" size={24} color={colors.success} />
              <Text style={[styles.researchItemText, { color: colors.success }]}>
                Lab Notebook
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.researchItem, { backgroundColor: colors.primary + '20' }]}
              onPress={() => {
                // Already on Experiment Ideas, just scroll to top or show current view
              }}
            >
              <Ionicons name="bulb-outline" size={24} color={colors.primary} />
              <Text style={[styles.researchItemText, { color: colors.primary }]}>
                Experiment Ideas
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Fresh from AI Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            FRESH FROM AI
          </Text>
          {feed.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="sparkles-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
                No AI ideas yet. Tap "Get Fresh" to generate some!
              </Text>
            </View>
          ) : (
            feed.map(idea => (
              <View key={idea.id} style={styles.ideaWrapper}>
                {renderIdea({ item: idea })}
              </View>
            ))
          )}
        </View>

        {/* Curated Starters Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CURATED STARTERS
          </Text>
          {curated.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="library-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
                No curated ideas available.
              </Text>
            </View>
          ) : (
            curated.map(idea => (
              <View key={idea.id} style={styles.ideaWrapper}>
                {renderIdea({ item: idea })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  getFreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  getFreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  ideaWrapper: {
    marginBottom: 16,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptySectionText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
  },
  ideaCard: {
    marginBottom: 16,
    padding: 20,
  },
  ideaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ideaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ideaInfo: {
    flex: 1,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  ideaMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '700',
  },
  processBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  processText: {
    fontSize: 9,
    fontWeight: '600',
  },
  ideaSummary: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  densityText: {
    fontSize: 12,
    marginBottom: 12,
  },
  ingredientsSection: {
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 12,
    marginBottom: 6,
  },
  ingredientItem: {
    fontSize: 13,
    marginBottom: 2,
    paddingLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ideaDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ideaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updatedAt: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  createIdeaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: 200,
  },
  createIdeaButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  researchSection: {
    padding: 16,
  },
  researchCard: {
    padding: 16,
  },
  researchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  researchItems: {
    flexDirection: 'row',
    gap: 12,
  },
  researchItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  researchItemText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
