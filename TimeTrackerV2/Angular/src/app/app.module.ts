import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, RoutingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';



import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminDashComponent } from './admin-dash/admin-dash.component';
import { RegisterComponent } from './register/register.component';
import { InstructorComponent } from './instructor/instructor.component';
import { GroupsComponent } from './groups/groups.component';
import { AdminModalComponent } from './modals/admin-modal/admin-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    RoutingComponents,
    LoginComponent,
    AdminDashComponent,
    RegisterComponent,
    GroupsComponent,
    AdminModalComponent,
    InstructorComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [FormBuilder],
  bootstrap: [AppComponent]
})
export class AppModule { }
