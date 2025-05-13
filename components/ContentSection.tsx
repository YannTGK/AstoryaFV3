import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

export type ContentItem = {
  uri: string;
  [key: string]: any;
};

type Props = {
  type: 'photos' | 'videos' | 'audios' | 'documents' | 'messages' | 'vr';
  items: ContentItem[];
  emptyIcon: any;
  emptyText: string;
  onAdd: () => void;
  onItemPress: (item: ContentItem, index: number) => void;
};

export default function ContentSection({
  type,
  items,
  emptyIcon,
  emptyText,
  onAdd,
  onItemPress,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const viewerData = items.map((it) => ({ url: it.uri }));

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Image source={emptyIcon} style={{ width: 130, height: 130 }} />
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: ContentItem; index: number }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedIndex(index);
        setModalVisible(true);
        onItemPress(item, index);
      }}
      style={type === 'photos' ? styles.photoItem : styles.generalItem}
    >
      {type === 'photos' ? (
        <Image source={{ uri: item.uri }} style={styles.photoImage} />
      ) : (
        // Placeholder for other types, adjust per need
        <View style={styles.generalPlaceholder}>
          <Text style={styles.generalText}>{type.toUpperCase()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {items.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, i) => String(i)}
          numColumns={type === 'photos' ? 3 : 1}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>

      {type === 'photos' && (
        <Modal transparent visible={modalVisible}>
          <ImageViewer
            imageUrls={viewerData}
            index={selectedIndex}
            onCancel={() => setModalVisible(false)}
            enableSwipeDown
            onSwipeDown={() => setModalVisible(false)}
          />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#fff',
    fontFamily: 'Alice-Regular',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 180,
    paddingTop: 32,
  },
  photoItem: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 16,
  },
  photoImage: {
    width: 109,
    height: 109,
    borderRadius: 8,
  },
  generalItem: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#11152A',
    borderRadius: 8,
  },
  generalPlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generalText: {
    color: '#fff',
    fontFamily: 'Alice-Regular',
  },
  addButton: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: '#FEEDB6',
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  plus: {
    fontSize: 48,
    color: '#11152A',
  },
  closeBtn: {
    position: 'absolute',
    top: 72,
    right: 20,
    zIndex: 101,
  },
  closeText: {
    color: '#fff',
    fontSize: 32,
  },
});