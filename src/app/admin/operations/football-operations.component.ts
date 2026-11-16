import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OpsMetric } from './ops-metric-card.component';

type FootballView = 'series' | 'series-add' | 'matches' | 'match-add' | 'contest' | 'contest-add';

interface SeriesRow {
  name: string;
  id: string;
  type: string;
  icon: string;
  color: string;
  window: string;
  matches: string;
  contests: string;
  prize: string;
  users: string;
  status: 'Live' | 'Upcoming';
}

interface MatchRow {
  home: string;
  away: string;
  score: string;
  series: string;
  seriesTone: string;
  kickoff: string;
  contests: string;
  pot: string;
  status: 'Live 78’' | 'Live 34’' | 'Live 62’' | 'Upcoming' | 'Played' | 'VAR Review';
}

interface ChecklistItem {
  label: string;
  done: boolean;
}

@Component({
  selector: 'app-football-operations',
  templateUrl: './football-operations.component.html',
  styleUrls: ['./football-operations.component.css'],
})
export class FootballOperationsComponent implements OnInit, OnDestroy {
  private routeData?: Subscription;
  view: FootballView = 'series';

  readonly seriesMetrics: OpsMetric[] = [
    { label: 'Active Series', value: '14', detail: '6 leagues · 8 cups', color: '#ff3b47', spark: [8, 9, 10, 10, 11, 12, 12, 13, 13, 14, 14, 14, 14, 14] },
    { label: 'Upcoming', value: '6', detail: 'Next: Premier League 25/26', color: '#5b8def', spark: [2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 6, 6, 6] },
    { label: 'Active Matches', value: '42', change: '6', detail: 'Across all live series', color: '#a78bfa', spark: [28, 32, 36, 38, 40, 42, 40, 42, 42, 42, 42, 42, 42, 42] },
    { label: 'Active Contests', value: '118', change: '14', detail: '£1.2M total prize pool', color: '#ffb627', spark: [80, 90, 98, 104, 110, 114, 116, 118, 118, 118, 118, 118, 118, 118] },
  ];

  readonly matchMetrics: OpsMetric[] = [
    { label: 'Live Now', value: '3', detail: 'Premier · UCL · FA Cup', color: '#ff3b47', spark: [2, 3, 2, 4, 3, 4, 3, 4, 3, 3, 2, 3, 3, 3] },
    { label: 'Today', value: '14', detail: '6 already played · 5 upcoming', color: '#5b8def', spark: [8, 10, 12, 12, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14] },
    { label: 'This Week', value: '62', detail: '42 in active contests', color: '#a78bfa', spark: [40, 48, 54, 58, 60, 61, 62, 62, 62, 62, 62, 62, 62, 62] },
    { label: 'Result Disputes', value: '2', change: '1', direction: 'down', detail: 'VAR pending · 1 manual review', color: '#ffb627', spark: [5, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
  ];

  readonly series: SeriesRow[] = [
    { name: 'Premier League 25/26', id: 'SER-2505', type: 'League', icon: '⚽', color: '#5b8def', window: 'Aug 15 → May 24, 2026', matches: '380', contests: '38', prize: '£420K', users: '22.4K', status: 'Live' },
    { name: 'UEFA Champions League', id: 'SER-4315', type: 'Cup', icon: '🏆', color: '#a78bfa', window: 'Sep 16 → Jun 06, 2026', matches: '125', contests: '14', prize: '£186K', users: '14.8K', status: 'Live' },
    { name: 'FA Cup 25/26', id: 'SER-5782', type: 'Cup', icon: '🏆', color: '#ffb627', window: 'Nov 1 → May 17, 2026', matches: '96', contests: '8', prize: '£72K', users: '9.2K', status: 'Live' },
    { name: 'EFL Championship', id: 'SER-1702', type: 'League', icon: '⚽', color: '#2bd4a1', window: 'Aug 9 → May 04, 2026', matches: '552', contests: '42', prize: '£164K', users: '6.8K', status: 'Live' },
    { name: 'Europa League', id: 'SER-1040', type: 'Cup', icon: '🏆', color: '#ff6478', window: 'Sep 24 → May 27, 2026', matches: '189', contests: '12', prize: '£94K', users: '7.4K', status: 'Live' },
    { name: 'La Liga 25/26', id: 'SER-8261', type: 'League', icon: '⚽', color: '#ff8c95', window: 'Aug 16 → May 24, 2026', matches: '380', contests: '0', prize: '—', users: '0', status: 'Upcoming' },
    { name: 'World Cup 2026', id: 'SER-6926', type: 'Cup', icon: '🏆', color: '#ff3b47', window: 'Jun 11 → Jul 19, 2026', matches: '104', contests: '0', prize: '—', users: '0', status: 'Upcoming' },
    { name: 'Conference League', id: 'SER-9340', type: 'Cup', icon: '🏆', color: '#74e8c0', window: 'Sep 24 → May 27, 2026', matches: '141', contests: '6', prize: '£32K', users: '2.4K', status: 'Live' },
  ];

  readonly matches: MatchRow[] = [
    { home: 'Arsenal', away: 'Tottenham', score: '2 – 1', series: 'Premier League', seriesTone: 'blue', kickoff: 'Today 16:30', contests: '6', pot: '£28K', status: 'Live 78’' },
    { home: 'Real Madrid', away: 'Man City', score: '0 – 0', series: 'UEFA CL', seriesTone: 'violet', kickoff: 'Today 20:00', contests: '8', pot: '£42K', status: 'Live 34’' },
    { home: 'Liverpool', away: 'Brighton', score: '3 – 0', series: 'Premier League', seriesTone: 'blue', kickoff: 'Today 17:00', contests: '5', pot: '£18K', status: 'Live 62’' },
    { home: 'Chelsea', away: 'Everton', score: '—', series: 'Premier League', seriesTone: 'blue', kickoff: 'Today 19:45', contests: '4', pot: '£14K', status: 'Upcoming' },
    { home: 'Newcastle', away: 'Aston Villa', score: '—', series: 'Premier League', seriesTone: 'blue', kickoff: 'Tomorrow 14:00', contests: '4', pot: '£11K', status: 'Upcoming' },
    { home: 'Bayern', away: 'PSG', score: '—', series: 'UEFA CL', seriesTone: 'violet', kickoff: 'Tomorrow 20:00', contests: '9', pot: '£64K', status: 'Upcoming' },
    { home: 'Man United', away: 'Brentford', score: '2 – 2', series: 'Premier League', seriesTone: 'blue', kickoff: 'Yesterday 15:00', contests: '4', pot: '£12K', status: 'Played' },
    { home: 'Leicester', away: 'Norwich', score: '1 – 3', series: 'EFL Champ', seriesTone: 'green', kickoff: 'Yesterday 12:30', contests: '3', pot: '£4K', status: 'VAR Review' },
  ];

  readonly seriesChecklist: ChecklistItem[] = [
    { label: 'Identity & schedule', done: true },
    { label: 'At least 1 match imported', done: true },
    { label: 'Contest defaults set', done: true },
    { label: 'Compliance flags set', done: true },
    { label: 'Marketing banner uploaded', done: false },
    { label: 'Approval from Compliance', done: false },
  ];

  readonly matchChecklist: ChecklistItem[] = [
    { label: 'Fixture identity', done: true },
    { label: 'Scoring source connected', done: true },
    { label: 'Smart Release ran', done: true },
    { label: '3 contests configured', done: true },
    { label: 'Marketing creative', done: false },
    { label: 'Compliance sign-off', done: false },
  ];

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeData = this.route.data.subscribe(data => {
      const requestedView = data['view'] as FootballView | undefined;
      this.view = requestedView ?? 'series';
    });
  }

  ngOnDestroy(): void {
    this.routeData?.unsubscribe();
  }

  teamTone(team: string): string {
    const colors: Record<string, string> = {
      Arsenal: '#ef0107', Tottenham: '#132257', Liverpool: '#c8102e', Chelsea: '#034694',
      'Man City': '#6cabdd', 'Man United': '#da291c', 'Real Madrid': '#febe10',
      Bayern: '#dc052d', PSG: '#004170', Brighton: '#0057b8', Everton: '#003399',
      Newcastle: '#241f20', 'Aston Villa': '#7a003c', Brentford: '#e30613',
      Leicester: '#003090', Norwich: '#fff200',
    };
    return colors[team] ?? '#5b8def';
  }

  checklistTone(item: ChecklistItem): string {
    return item.done ? 'complete' : 'incomplete';
  }
}
