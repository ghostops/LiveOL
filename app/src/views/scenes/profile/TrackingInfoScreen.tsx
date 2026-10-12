import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, px } from '~/util/const';
import { OLText } from '~/views/components/text';
import { OLIcon } from '~/views/components/icon';
import { OLCard } from '~/views/components/card';

export const TrackingInfoScreen: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: 'person-add' as const,
      title: t('Add runner details'),
      description: t("Enter the runner's name and their clubs."),
    },
    {
      icon: 'search' as const,
      title: t('Smart matching'),
      description: t(
        'The system finds your runners across all competitions, even with (slightly) different spellings.',
      ),
    },
    {
      icon: 'notifications' as const,
      title: t('Get highlighted'),
      description: t(
        'See your followed runners instantly highlighted in competition results.',
      ),
    },
    {
      icon: 'sparkles' as const,
      title: t('Follow multiple runners'),
      description: t(
        'Without LiveOL+ you can follow yourself and one other runner. With LiveOL+ you can follow as many runners as you like.',
      ),
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}
      edges={['bottom', 'left', 'right']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: px(16),
        }}
      >
        <OLCard style={{ marginBottom: px(16) }}>
          <OLText size={20} bold style={{ marginBottom: px(16) }}>
            {t('How following a runner works')}
          </OLText>

          {steps.map((step, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: index < steps.length - 1 ? px(20) : 0,
              }}
            >
              <View
                style={{
                  width: px(40),
                  height: px(40),
                  borderRadius: px(20),
                  backgroundColor: COLORS.MAIN,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: px(12),
                }}
              >
                <OLIcon name={step.icon} size={22} color={COLORS.WHITE} />
              </View>
              <View
                style={{ flex: 1, minHeight: px(40), justifyContent: 'center' }}
              >
                <OLText size={16} bold style={{ marginBottom: px(4) }}>
                  {step.title}
                </OLText>
                <OLText size={14} style={{ color: COLORS.GRAY }}>
                  {step.description}
                </OLText>
              </View>
            </View>
          ))}
        </OLCard>

        {/* Example Section */}
        <OLCard>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: px(12),
            }}
          >
            <OLIcon
              name="bulb"
              size={20}
              color={COLORS.MAIN}
              style={{ marginRight: px(8) }}
            />
            <OLText size={16} bold>
              {t('Pro tip')}
            </OLText>
          </View>
          <OLText size={14} style={{ color: COLORS.GRAY }}>
            {t(
              'Add multiple clubs if your runner competes for different organizations. The system will find them wherever they race!',
            )}
          </OLText>
        </OLCard>

        <View style={{ height: px(32) }} />
      </ScrollView>
    </SafeAreaView>
  );
};
