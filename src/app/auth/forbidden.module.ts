import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({ template: '<main class="message-card"><p class="eyebrow">403 · ACCESS RESTRICTED</p><h1>Permission required</h1><p>Your account does not have permission to open this page.</p><a routerLink="/admin/dashboard">Back to dashboard</a></main>' })
class ForbiddenComponent {}
@NgModule({ declarations: [ForbiddenComponent], imports: [RouterModule.forChild([{ path: '', component: ForbiddenComponent }])] })
export class ForbiddenModule {}
