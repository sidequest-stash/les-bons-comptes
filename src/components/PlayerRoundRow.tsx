// Carte de saisie d'un joueur pour la manche courante : mise, plis, bonus +
// score live. Une carte par joueur, empilées sur une seule page (RoundScreen) —
// en système Rascal, s'y ajoute (si l'option est active) le type de mise.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BonusButtons from './BonusButtons';
import SegmentedToggle from './SegmentedToggle';
import Stepper from './Stepper';
import {
  bidKindOf,
  DEFAULT_BID_KIND,
  isEntryComplete,
  roundTotal,
} from '../lib/scoring';
import { BID_KINDS } from '../lib/scoreSystems';
import { formatSignedScore } from '../lib/format';
import { alpha, colors, fonts } from '../theme';
import { BidKind, RoundEntry, ScoreSystem } from '../lib/types';

type Props = {
  name: string;
  cumulative: number;
  entry: RoundEntry;
  cards: number;
  system: ScoreSystem;
  /** Option Rascal : affiche le choix chevrotine / boulet de canon. */
  cannonballRule?: boolean;
  onBid: (v: number) => void;
  onTricks: (v: number) => void;
  onBonus: (v: number) => void;
  onBidKind: (kind: BidKind) => void;
};

export default function PlayerRoundRow({
  name,
  cumulative,
  entry,
  cards,
  system,
  cannonballRule,
  onBid,
  onTricks,
  onBonus,
  onBidKind,
}: Props) {
  const complete = isEntryComplete(entry);
  const bidKind = bidKindOf(entry);
  const roundScore = complete ? roundTotal(entry, cards, system) : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.cumulative}>{cumulative} pts</Text>
      </View>

      <View style={styles.field}>
        <View style={styles.fieldHead}>
          <Text style={styles.fieldLabel}>Sa mise</Text>
          <Text style={styles.fieldMax}>max {cards}</Text>
        </View>
        <Stepper
          value={entry.bid}
          min={0}
          max={cards}
          onChange={onBid}
          accent={colors.sanguine}
          decrementLabel={`Diminuer la mise de ${name}`}
          incrementLabel={`Augmenter la mise de ${name}`}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.fieldHead}>
          <Text style={styles.fieldLabel}>Plis remportés</Text>
          <Text style={styles.fieldMax}>max {cards}</Text>
        </View>
        <Stepper
          value={entry.tricks}
          min={0}
          max={cards}
          onChange={onTricks}
          accent={colors.paille}
          decrementLabel={`Diminuer les plis de ${name}`}
          incrementLabel={`Augmenter les plis de ${name}`}
        />
      </View>

      {system === 'rascal' && cannonballRule && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Type de mise</Text>
          <SegmentedToggle
            options={[
              { id: BID_KINDS[0].key, name: BID_KINDS[0].name },
              { id: BID_KINDS[1].key, name: BID_KINDS[1].name },
            ]}
            selectedId={bidKind}
            onSelect={(id) => onBidKind(id ?? DEFAULT_BID_KIND)}
          />
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Bonus & malus</Text>
        <BonusButtons value={entry.bonus ?? 0} onChange={onBonus} />
      </View>

      <View style={styles.scoreFooter}>
        <Text style={styles.scoreFooterLabel}>Cette manche</Text>
        <Text
          style={[
            styles.scoreValue,
            roundScore == null
              ? styles.scoreEmpty
              : roundScore > 0
                ? styles.scoreGain
                : roundScore < 0
                  ? styles.scoreLoss
                  : styles.scoreEmpty,
          ]}
        >
          {roundScore == null ? '—' : formatSignedScore(roundScore)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha.creme(0.3),
    padding: 18,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  name: {
    fontFamily: fonts.displayBlack,
    fontSize: 28,
    lineHeight: Math.round(28 * 0.9),
    textTransform: 'uppercase',
    color: colors.creme,
    flexShrink: 1,
  },
  cumulative: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: alpha.creme(0.55),
  },
  field: { gap: 8 },
  fieldHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  fieldLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: 'uppercase',
    color: alpha.creme(0.5),
  },
  fieldMax: { fontFamily: fonts.mono, fontSize: 10, color: alpha.creme(0.4) },
  scoreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: alpha.creme(0.16),
    paddingTop: 14,
  },
  scoreFooterLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    letterSpacing: 9 * 0.18,
    textTransform: 'uppercase',
    color: alpha.creme(0.5),
  },
  scoreValue: {
    fontFamily: fonts.displayBlack,
    fontSize: 34,
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
  scoreEmpty: { color: alpha.creme(0.4) },
  scoreGain: { color: colors.paille },
  scoreLoss: { color: colors.grenat },
});
