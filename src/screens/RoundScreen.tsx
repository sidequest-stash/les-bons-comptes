// Écran de saisie de la manche courante — tous les joueurs sur une seule page.
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import Callout from '../components/Callout';
import HeaderPill from '../components/HeaderPill';
import PlayerRoundRow from '../components/PlayerRoundRow';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import { useStore } from '../lib/store';
import {
  bidsEnteredForRound,
  cardsForRound,
  cumulativeTotal,
  DEFAULT_BID_KIND,
  isEntryComplete,
  rascalPotential,
  tricksEnteredForRound,
} from '../lib/scoring';
import { alpha, colors, fonts } from '../theme';

export default function RoundScreen() {
  const game = useStore((s) => s.game);
  const setScreen = useStore((s) => s.setScreen);
  const setBid = useStore((s) => s.setBid);
  const setTricks = useStore((s) => s.setTricks);
  const setBonus = useStore((s) => s.setBonus);
  const setBidKind = useStore((s) => s.setBidKind);
  const commitRound = useStore((s) => s.commitRound);
  const goToRound = useStore((s) => s.goToRound);

  if (!game) return null;

  const round = game.currentRound;
  const cards = cardsForRound(game.cardsPerRound, round);
  const editMode = !!game.finishedAt;
  const showPotential = game.scoreSystem === 'rascal' && !game.cannonballRule;

  const entries = game.players.map((p) => game.rounds[round]?.[p.id]);
  const allComplete = entries.every((e) => isEntryComplete(e));

  const bidsSum = bidsEnteredForRound(game, round);
  const tricksSum = tricksEnteredForRound(game, round);
  // Avertissement non bloquant : uniquement une fois la saisie des plis commencée
  // (à l'état initial tout est à 0, on ne veut pas alerter).
  const tricksMismatch = tricksSum !== 0 && tricksSum !== cards;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <ScreenHeader
            left={
              <BackButton
                label={
                  editMode
                    ? 'Scores'
                    : round > 1
                      ? `Manche ${String(round - 1).padStart(2, '0')}`
                      : 'Accueil'
                }
                onPress={() =>
                  editMode
                    ? setScreen('scoreboard')
                    : round > 1
                      ? goToRound(round - 1)
                      : setScreen('home')
                }
              />
            }
            right={
              <HeaderPill
                label="Scores ⌃"
                onPress={() => setScreen('scoreboard')}
              />
            }
          />

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>
                  {editMode
                    ? `Modifier la manche ${round}`
                    : `Manche ${String(round).padStart(2, '0')}`}
                </Text>
                <Text style={styles.meta}>
                  {cards} carte{cards > 1 ? 's' : ''} distribuée
                  {cards > 1 ? 's' : ''}
                  {showPotential
                    ? ` · potentiel ${rascalPotential(cards, DEFAULT_BID_KIND)} pts`
                    : ''}
                </Text>
              </View>
              {!editMode && (
                <View
                  style={[
                    styles.bidsBadge,
                    {
                      backgroundColor:
                        bidsSum === cards ? colors.paille : colors.grenat,
                    },
                  ]}
                >
                  <Text style={styles.bidsBadgeText}>
                    {bidsSum} mise{bidsSum > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {tricksMismatch && (
              <Callout>
                {`${tricksSum} pli${tricksSum > 1 ? 's' : ''} annoncé${tricksSum > 1 ? 's' : ''} pour ${cards} carte${cards > 1 ? 's' : ''} — vérifiez, ou continuez.`}
              </Callout>
            )}

            {game.players.map((player, i) => {
              const entry = entries[i] ?? {
                bid: 0,
                tricks: 0,
                bonus: 0,
                validated: false,
              };
              return (
                <PlayerRoundRow
                  key={player.id}
                  name={player.name}
                  cumulative={cumulativeTotal(game, player.id)}
                  entry={entry}
                  cards={cards}
                  system={game.scoreSystem}
                  cannonballRule={game.cannonballRule}
                  onBid={(v) => setBid(round, player.id, v)}
                  onTricks={(v) => setTricks(round, player.id, v)}
                  onBonus={(v) => setBonus(round, player.id, v)}
                  onBidKind={(kind) => setBidKind(round, player.id, kind)}
                />
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            {editMode ? (
              <Button
                label="Retour au tableau des scores"
                onPress={() => setScreen('scoreboard')}
              />
            ) : (
              <Button
                label="Valider la manche"
                onPress={commitRound}
                disabled={!allComplete}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 22 },
  // paddingRight supplémentaire : la barre de défilement native colle sinon
  // au bord droit des cartes joueur (rendu natif seulement, cf. ScoreboardScreen).
  body: { paddingVertical: 18, gap: 18, paddingRight: 6 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  bidsBadge: {
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  bidsBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 10 * 0.12,
    color: colors.fond,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 46,
    lineHeight: Math.round(46 * 0.86),
    textTransform: 'uppercase',
    color: colors.creme,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    lineHeight: 15,
    color: alpha.creme(0.55),
    marginTop: 7,
  },
  footer: { paddingVertical: 18 },
});
