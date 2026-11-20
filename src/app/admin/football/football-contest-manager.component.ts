import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({ selector: 'app-football-contest-manager', templateUrl: './football-contest-manager.component.html', styleUrls: ['./football-contest-manager.component.css'] })
export class FootballContestManagerComponent implements OnInit {
  loading = false; error = ''; match: any = null; summary: any = {}; contests: any[] = [];
  constructor(private readonly route: ActivatedRoute, private readonly admin: AdminService) {}
  get hasMatchId(): boolean { return !!this.route.snapshot.paramMap.get('matchId'); }
  ngOnInit(): void { const id = this.route.snapshot.paramMap.get('matchId'); if (id) this.load(id); else this.error = 'Select a match to view its contests.'; }
  load(id = this.route.snapshot.paramMap.get('matchId') ?? ''): void {
    if (!id) return; this.loading = true; this.error = '';
    this.admin.getMatchContests(id).subscribe({ next: r => {
      const data = r?.success === false ? null : r?.data;
      this.match = data?.match && typeof data.match === 'object' ? data.match : null;
      this.summary = data?.summary && typeof data.summary === 'object' ? data.summary : {};
      this.contests = Array.isArray(data?.contests) ? data.contests : [];
      this.loading = false;
    }, error: () => { this.match = null; this.summary = {}; this.contests = []; this.error = 'Match contests could not be loaded.'; this.loading = false; } });
  }
  num(v: unknown): string { return v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toLocaleString(); }
  money(v: unknown): string { return v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toLocaleString(undefined, { style: 'currency', currency: 'GBP' }); }
  percent(v: unknown): string { return v == null || !Number.isFinite(Number(v)) ? '—' : `${Number(v)}%`; }
}
