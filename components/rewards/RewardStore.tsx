import { Colors } from '@/constants/theme';
import { gamificationService } from '@/services/gamificationService';
import { triggerHapticFeedback } from '@/utils/animations';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RewardItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'meditation' | 'yoga' | 'fitness' | 'premium' | 'insurance';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isPurchased?: boolean;
}

interface RewardStoreProps {
  onBack: () => void;
  userCoins: number;
}

const REWARD_ITEMS: RewardItem[] = [
  {
    id: 'premium-meditation-1',
    title: 'Deep Sleep Meditation Pack',
    description: '10 guided sleep meditations by wellness experts',
    price: 150,
    category: 'meditation',
    icon: 'moon',
    color: '#9C27B0',
  },
  {
    id: 'ar-poses-1',
    title: 'Advanced Yoga Poses',
    description: 'Unlock 5 advanced AR yoga poses with expert guidance',
    price: 200,
    category: 'yoga',
    icon: 'body',
    color: '#4ECDC4',
  },
  {
    id: 'workout-plan-1',
    title: 'Personal Trainer Sessions',
    description: 'Custom workout plans tailored to your fitness goals',
    price: 300,
    category: 'fitness',
    icon: 'barbell',
    color: '#FF6B6B',
  },
  {
    id: 'mindfulness-course',
    title: 'Mindfulness Mastery Course',
    description: '30-day guided mindfulness journey with daily practices',
    price: 250,
    category: 'meditation',
    icon: 'leaf',
    color: '#4CAF50',
  },
  {
    id: 'insurance-premium-1',
    title: '5% Premium Discount',
    description: 'Reduce your monthly insurance premium for 6 months',
    price: 500,
    category: 'insurance',
    icon: 'shield-checkmark',
    color: '#FF9800',
  },
  {
    id: 'brain-games-pro',
    title: 'Brain Games Pro Pack',
    description: 'Unlock advanced brain training games and challenges',
    price: 180,
    category: 'premium',
    icon: 'bulb',
    color: '#E91E63',
  },
  {
    id: 'wellness-tracker',
    title: 'Advanced Analytics',
    description: 'Detailed wellness insights and progress tracking',
    price: 120,
    category: 'premium',
    icon: 'analytics',
    color: '#2196F3',
  },
  {
    id: 'family-plan',
    title: 'Family Wellness Plan',
    description: 'Share premium features with up to 4 family members',
    price: 400,
    category: 'premium',
    icon: 'people',
    color: '#795548',
  },
];

export default function RewardStore({ onBack, userCoins }: RewardStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'All', icon: 'grid' as const, color: '#666' },
    { id: 'meditation', label: 'Meditation', icon: 'leaf' as const, color: '#9C27B0' },
    { id: 'yoga', label: 'Yoga', icon: 'body' as const, color: '#4ECDC4' },
    { id: 'fitness', label: 'Fitness', icon: 'barbell' as const, color: '#FF6B6B' },
    { id: 'premium', label: 'Premium', icon: 'star' as const, color: '#FFD700' },
    { id: 'insurance', label: 'Insurance', icon: 'shield' as const, color: '#FF9800' },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? REWARD_ITEMS 
    : REWARD_ITEMS.filter(item => item.category === selectedCategory);

  const handlePurchase = async (item: RewardItem) => {
    if (userCoins < item.price) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${item.price - userCoins} more coins to purchase this item.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (purchasedItems.includes(item.id)) {
      Alert.alert('Already Owned', 'You already own this item!');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Purchase "${item.title}" for ${item.price} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          style: 'default',
          onPress: async () => {
            // Deduct coins
            await gamificationService.spendCoins(item.price, `Purchased: ${item.title}`);
            
            // Add to purchased items
            setPurchasedItems(prev => [...prev, item.id]);
            
            triggerHapticFeedback('success');
            
            Alert.alert(
              'Purchase Successful! 🎉',
              `You've unlocked "${item.title}". Check your profile to access your new content.`,
              [{ text: 'Awesome!', style: 'default' }]
            );
          },
        },
      ]
    );
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#666';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Reward Store</Text>
        <View style={styles.coinsDisplay}>
          <Ionicons name="diamond" size={wp(5)} color="#FFD700" />
          <Text style={styles.coinsText}>{userCoins}</Text>
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && { backgroundColor: category.color + '20' },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={wp(4)} 
                color={selectedCategory === category.id ? category.color : '#666'} 
              />
              <Text 
                style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? category.color : '#666' }
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Store Items */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => {
            const isPurchased = purchasedItems.includes(item.id);
            const canPurchase = userCoins >= item.price && !isPurchased;

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={[styles.itemIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={wp(6)} color={item.color} />
                </View>
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  
                  <View style={styles.itemFooter}>
                    <View style={styles.priceContainer}>
                      <Ionicons name="diamond" size={wp(4)} color="#FFD700" />
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.purchaseButton,
                        isPurchased 
                          ? { backgroundColor: '#4CAF50' }
                          : canPurchase 
                            ? { backgroundColor: item.color }
                            : { backgroundColor: '#CCCCCC' }
                      ]}
                      onPress={() => handlePurchase(item)}
                      disabled={isPurchased || !canPurchase}
                    >
                      {isPurchased ? (
                        <Ionicons name="checkmark" size={wp(4)} color="white" />
                      ) : (
                        <Text style={styles.buttonText}>
                          {canPurchase ? 'Buy' : 'Need More'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {isPurchased && (
                  <View style={styles.ownedBadge}>
                    <Ionicons name="checkmark-circle" size={wp(5)} color="#4CAF50" />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Earn More Coins Section */}
        <View style={styles.earnMoreSection}>
          <Text style={styles.earnMoreTitle}>Need More Coins? 💰</Text>
          <Text style={styles.earnMoreText}>
            Complete daily tasks, play brain games, do AR yoga, and engage with wellness activities to earn more coins!
          </Text>
          <View style={styles.earnTips}>
            <View style={styles.earnTip}>
              <Ionicons name="flash" size={wp(4)} color="#FFD700" />
              <Text style={styles.tipText}>Daily Focus Tasks: 15-30 coins</Text>
            </View>
            <View style={styles.earnTip}>
              <Ionicons name="bulb" size={wp(4)} color="#FF6B6B" />
              <Text style={styles.tipText}>Brain Games: 50-100 coins</Text>
            </View>
            <View style={styles.earnTip}>
              <Ionicons name="body" size={wp(4)} color="#4ECDC4" />
              <Text style={styles.tipText}>AR Yoga Sessions: 30-70 coins</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(6),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: wp(2),
  },
  title: {
    fontSize: rfs(24),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(6),
  },
  coinsText: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: wp(1),
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(6),
    marginHorizontal: wp(1),
  },
  categoryText: {
    fontSize: rfs(12),
    fontWeight: '600',
    marginLeft: wp(1),
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  itemsGrid: {
    paddingVertical: hp(2),
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  itemIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(0.5),
  },
  itemDescription: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    lineHeight: rfs(16),
    marginBottom: hp(2),
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: wp(1),
  },
  purchaseButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: wp(20),
  },
  buttonText: {
    fontSize: rfs(12),
    fontWeight: 'bold',
    color: 'white',
  },
  ownedBadge: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
  },
  earnMoreSection: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(4),
    alignItems: 'center',
  },
  earnMoreTitle: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  earnMoreText: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: rfs(20),
    marginBottom: hp(2),
  },
  earnTips: {
    width: '100%',
  },
  earnTip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
  },
  tipText: {
    fontSize: rfs(12),
    color: Colors.light.text,
    marginLeft: wp(2),
  },
});