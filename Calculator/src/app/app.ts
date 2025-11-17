import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  currentExpression: string = '';
  result: string = '0';
  previousExpression: string = '';
  // When true the last action was '=' so next number press should start a new expression
  lastActionWasEqual: boolean = false;
  // Whether the launcher was clicked and the app is opened
  opened: boolean = false;

  addNumber(number: string) {
    // If the last action was '=', start a new expression when number is pressed
    if (this.lastActionWasEqual) {
      this.currentExpression = number;
      this.result = '0';
      this.lastActionWasEqual = false;
      return;
    }

    if (this.currentExpression === '') {
      this.currentExpression = number;
    } else {
      this.currentExpression += number;
    }
  }

  addOperation(op: string) {
    // If last action was '=' allow continuing with the displayed result
    if (this.lastActionWasEqual) {
      this.currentExpression = this.result + op;
      this.lastActionWasEqual = false;
      return;
    }

    // If expression already ends with an operator, replace it with the new one
    if (/[+\-*/]$/.test(this.currentExpression)) {
      this.currentExpression = this.currentExpression.slice(0, -1) + op;
    } else {
      // Append operator so expression grows like: 1+2+3+
      this.currentExpression += op;
    }
  }

  calculate() {
    // Don't calculate if there's no expression or if it ends with an operator
    if (!this.currentExpression || /[+\-*/]$/.test(this.currentExpression)) {
      return;
    }

    // Evaluate the expression shown in display.
    // Only allow digits, operators and decimal point to avoid unsafe eval.
    const expr = this.currentExpression.replace(/\s+/g, '');
    if (!/^[0-9.+\-*/]+$/.test(expr)) {
      // If expression is invalid, just return the numeric value of expression if possible
      return Number(this.currentExpression) || 0;
    }

    try {
      // Use Function to evaluate in a safer way than eval (still local)
      // Wrap in parentheses so trailing operators cause syntax error
      const result = Function('"use strict";return (' + expr + ')')();
      if (this.lastActionWasEqual) {
        this.previousExpression = ''; // Clear previous when calculating again
      } else {
        this.previousExpression = this.currentExpression + ' = ' + result; // Save current as previous
      }
      this.result = String(result);
      this.lastActionWasEqual = true;
      return result;
    } catch (e) {
      // If evaluation fails (e.g., trailing operator), try to evaluate without trailing operator
      const trimmed = expr.replace(/[+\-*/]+$/, '');
      try {
        const result = Function('"use strict";return (' + trimmed + ')')();
        this.result = String(result);
        this.lastActionWasEqual = true;
        return result;
      } catch (e2) {
        return Number(this.currentExpression) || 0;
      }
    }
  }

  clear() {
    this.currentExpression = '';
    this.result = '0';
    this.previousExpression = '';
    this.lastActionWasEqual = false;
  }

  openApp() {
    this.opened = true;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Only handle keyboard events when calculator is opened
    if (!this.opened) return;

    // Prevent default behavior for calculator keys
    if (this.isCalculatorKey(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '.':
        this.addNumber(event.key);
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        this.addOperation(event.key);
        break;
      case 'Enter':
      case '=':
        if (this.currentExpression && !this.currentExpression.match(/[+\-*/]$/)) {
          this.calculate();
        }
        break;
      case 'Escape':
      case 'c':
      case 'C':
        this.clear();
        break;
      case 'Backspace':
        this.handleBackspace();
        break;
    }
  }

  private isCalculatorKey(key: string): boolean {
    return /^[0-9.+\-*/=cC]$/.test(key) || 
           key === 'Enter' || 
           key === 'Escape' || 
           key === 'Backspace';
  }

  private handleBackspace() {
    if (!this.lastActionWasEqual) {
      this.currentExpression = this.currentExpression.slice(0, -1);
      if (this.currentExpression === '') {
        this.currentExpression = '0';
      }
    }
  }
}

