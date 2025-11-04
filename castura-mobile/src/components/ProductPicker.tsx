// src/components/ProductPicker.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import type { Product } from '../types';

interface ProductPickerProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
  placeholder?: string;
}

export default function ProductPicker({ 
  products, 
  selectedProduct, 
  onSelect, 
  placeholder = "Select a product" 
}: ProductPickerProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (product: Product | null) => {
    onSelect(product);
    setModalVisible(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.productSlug, { color: colors.textSecondary }]}>
          {item.slug}
        </Text>
      </View>
      <View style={styles.productMeta}>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.public ? colors.success : colors.surface,
          borderColor: colors.border 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.public ? '#ffffff' : colors.textSecondary 
          }]}>
            {item.public ? 'Public' : 'Private'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[styles.picker, { 
          backgroundColor: colors.surface, 
          borderColor: colors.border 
        }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.pickerContent}>
          <Text style={[styles.pickerText, { 
            color: selectedProduct ? colors.text : colors.textSecondary 
          }]}>
            {selectedProduct ? selectedProduct.title : placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Product
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            style={styles.productList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No products available
                </Text>
              </View>
            }
          />

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.border }]}
              onPress={() => handleSelect(null)}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                Clear Selection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  productList: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productSlug: {
    fontSize: 14,
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  productMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
