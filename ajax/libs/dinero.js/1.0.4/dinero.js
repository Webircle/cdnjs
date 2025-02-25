(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Dinero = factory());
}(this, (function () { 'use strict';

  /**
   * Default values for all Dinero objects.
   *
   * You can override default values for all subsequent Dinero objects by changing them directly on the global `Dinero` object.
   * Existing instances won't be affected.
   *
   * @property {Number} defaultAmount - The default amount for new Dinero objects (see {@link module:Dinero Dinero} for format).
   * @property {String} defaultCurrency - The default currency for new Dinero objects (see {@link module:Dinero Dinero} for format).
   *
   * @example
   * // Will set currency to 'EUR' for all Dinero objects.
   * Dinero.defaultCurrency = 'EUR'
   *
   * @type {Object}
   */
  var Defaults = {
    defaultAmount: 0,
    defaultCurrency: 'USD'

    /**
     * Global settings for all Dinero objects.
     *
     * You can override global values for all subsequent Dinero objects by changing them directly on the global `Dinero` object.
     * Existing instances won't be affected.
     *
     * @property {String}  globalLocale - The global locale for new Dinero objects (see {@link module:Dinero~setLocale setLocale} for format).
     * @property {String}  globalFormat - The global format for new Dinero objects (see {@link module:Dinero~toFormat toFormat} for format).
     *
     * @example
     * // Will set locale to 'fr-FR' for all Dinero objects.
     * Dinero.globalLocale = 'fr-FR'
     *
     * @type {Object}
     */
  };var Globals = {
    globalLocale: 'en-US',
    globalFormat: '$0,0.00'
  };

  /**
   * Returns whether a value is numeric.
   * @ignore
   *
   * @param  {} value - The value to test.
   *
   * @return {Boolean}
   */
  function isNumeric(value) {
    return !isNaN(parseInt(value)) && isFinite(value);
  }

  /**
   * Returns whether a value is even.
   * @ignore
   *
   * @param  {Number} value - The value to test.
   *
   * @return {Boolean}
   */
  function isEven(value) {
    return value % 2 === 0;
  }

  /**
   * Returns whether a value is a float.
   * @ignore
   *
   * @param  {}  value - The value to test.
   *
   * @return {Boolean}
   */
  function isFloat(value) {
    return isNumeric(value) && !Number.isInteger(value);
  }

  /**
   * Returns how many fraction digits a number has.
   * @ignore
   *
   * @param  {Number} number - The number to test.
   *
   * @return {Number}
   */
  function countFractionDigits() {
    var number = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var fractionDigits = number.toString().split('.')[1];
    return fractionDigits ? fractionDigits.length : 0;
  }

  function Calculator() {
    var floatMultiply = function floatMultiply(a, b) {
      var getFactor = function getFactor(number) {
        return Math.pow(10, countFractionDigits(number));
      };
      var factor = Math.max(getFactor(a), getFactor(b));
      return a * factor * (b * factor) / (factor * factor);
    };

    return {
      /**
       * Returns the sum of two numbers.
       * @ignore
       *
       * @param {Number} a - The first number to add.
       * @param {Number} b - The second number to add.
       *
       * @return {Number}
       */
      add: function add(a, b) {
        return a + b;
      },

      /**
       * Returns the difference of two numbers.
       * @ignore
       *
       * @param {Number} a - The first number to subtract.
       * @param {Number} b - The second number to subtract.
       *
       * @return {Number}
       */
      subtract: function subtract(a, b) {
        return a - b;
      },

      /**
       * Returns the product of two numbers.
       * @ignore
       *
       * @param {Number} a - The first number to multiply.
       * @param {Number} b - The second number to multiply.
       *
       * @return {Number}
       */
      multiply: function multiply(a, b) {
        return isFloat(a) || isFloat(b) ? floatMultiply(a, b) : a * b;
      },

      /**
       * Returns the quotient of two numbers.
       * @ignore
       *
       * @param {Number} a - The first number to divide.
       * @param {Number} b - The second number to divide.
       *
       * @return {Number}
       */
      divide: function divide(a, b) {
        return a / b;
      },

      /**
       * Returns the remainder of two numbers.
       * @ignore
       *
       * @param  {Number} a - The first number to divide.
       * @param  {Number} b - The second number to divide.
       *
       * @return {Number}
       */
      modulo: function modulo(a, b) {
        return a % b;
      },

      /**
       * Returns a rounded number where if the input number is equidistant from the
       * two nearest integers it is rounded to the nearest even integer.
       * @ignore
       *
       * @param  {Number} value - The number to round.
       *
       * @return {Number}
       */
      bankersRound: function bankersRound(value) {
        var rounded = Math.round(value);
        return Math.abs(value) % 1 === 0.5 ? isEven(rounded) ? rounded : rounded - 1 : rounded;
      }
    };
  }

  var calculator = Calculator();

  function Format(format) {
    var matches = /^(?:(\$|USD)?0(?:(,)0)?(\.)?(0+)?|0(?:(,)0)?(\.)?(0+)?\s?(dollar)?)$/gm.exec(format);

    return {
      /**
       * Returns the matches.
       * @return {Array}
       * @ignore
       */
      getMatches: function getMatches() {
        return matches !== null ? matches.slice(1).filter(function (match) {
          return typeof match !== 'undefined';
        }) : [];
      },

      /**
       * Returns the amount of fraction digits to display.
       * @return {Number}
       * @ignore
       */
      getMinimumFractionDigits: function getMinimumFractionDigits() {
        var decimalPosition = function decimalPosition(match) {
          return match === '.';
        };
        return typeof this.getMatches().find(decimalPosition) !== 'undefined' ? this.getMatches()[calculator.add(this.getMatches().findIndex(decimalPosition), 1)].split('').length : 0;
      },

      /**
       * Returns the currency display mode.
       * @return {String}
       * @ignore
       */
      getCurrencyDisplay: function getCurrencyDisplay() {
        var modes = {
          USD: 'code',
          dollar: 'name',
          $: 'symbol'
        };
        return modes[this.getMatches().find(function (match) {
          return match === 'USD' || match === 'dollar' || match === '$';
        })];
      },

      /**
       * Returns the formatting style.
       * @return {String}
       * @ignore
       */
      getStyle: function getStyle() {
        return typeof this.getCurrencyDisplay(this.getMatches()) !== 'undefined' ? 'currency' : 'decimal';
      },

      /**
       * Returns whether grouping should be used or not.
       * @return {Boolean}
       * @ignore
       */
      getUseGrouping: function getUseGrouping() {
        return typeof this.getMatches().find(function (match) {
          return match === ',';
        }) !== 'undefined';
      }
    };
  }

  var calculator$1 = Calculator();

  /**
   * A Dinero object is an immutable data structure representing a specific monetary value.
   * It comes with methods for creating, parsing, manipulating, testing, transforming and formatting them.
   *
   * A Dinero object posesses:
   *
   * * An `amount`, expressed in cents.
   * * A `currency`, expressed as an {@link https://en.wikipedia.org/wiki/ISO_4217#Active_codes ISO 4217 currency code}.
   * * An optional `locale` property that affects how output strings are formatted.
   *
   * Here's an overview of the public API:
   *
   * * **Access:** {@link module:Dinero~getAmount getAmount}, {@link module:Dinero~getCurrency getCurrency} and {@link module:Dinero~getLocale getLocale}.
   * * **Manipulation:** {@link module:Dinero~add add}, {@link module:Dinero~subtract subtract}, {@link module:Dinero~multiply multiply}, {@link module:Dinero~divide divide}, {@link module:Dinero~percentage percentage} and {@link module:Dinero~allocate allocate}.
   * * **Testing:** {@link module:Dinero~equalsTo equalsTo}, {@link module:Dinero~lessThan lessThan}, {@link module:Dinero~lessThanOrEqual lessThanOrEqual}, {@link module:Dinero~greaterThan greaterThan}, {@link module:Dinero~greaterThanOrEqual greaterThanOrEqual}, {@link module:Dinero~isZero isZero}, {@link module:Dinero~isPositive isPositive}, {@link module:Dinero~isNegative isNegative}, {@link module:Dinero~hasCents hasCents}, {@link module:Dinero~hasSameCurrency hasSameCurrency} and {@link module:Dinero~hasSameAmount hasSameAmount}.
   * * **Configuration:** {@link module:Dinero~setLocale setLocale}.
   * * **Conversion & formatting:** {@link module:Dinero~toFormat toFormat}, {@link module:Dinero~toUnit toUnit}, {@link module:Dinero~toRoundedUnit toRoundedUnit} and {@link module:Dinero~toObject toObject}.
   *
   * @module Dinero
   * @param  {Number} options.amount - The amount in cents (as an integer).
   * @param  {String} options.currency - An ISO 4217 currency code.
   *
   * @throws {TypeError} If `amount` or `Dinero.defaultAmount` is invalid.
   *
   * @return {Object}
   */
  var Dinero = function Dinero(options) {
    /* istanbul ignore next */
    var assert = {
      hasSameCurrency: function hasSameCurrency(comparator) {
        if (!_hasSameCurrency.call(this, comparator)) {
          throw new TypeError('You must provide a Dinero instance with the same currency.');
        }
      },
      isPercentage: function isPercentage(percentage) {
        if (!(isNumeric(percentage) && percentage <= 100 && percentage >= 0)) {
          throw new RangeError('You must provide a numeric value between 0 and 100.');
        }
      },
      areValidRatios: function areValidRatios(ratios) {
        if (!(ratios.length && ratios.every(function (ratio) {
          return ratio > 0;
        }))) {
          throw new TypeError('You must provide a non-empty array of numeric values greater than 0.');
        }
      },
      isInteger: function isInteger(number) {
        if (!Number.isInteger(number)) {
          throw new TypeError('You must provide an integer.');
        }
      }
    };

    var _Object$assign = Object.assign({}, {
      amount: Dinero.defaultAmount,
      currency: Dinero.defaultCurrency
    }, options),
        amount = _Object$assign.amount,
        currency = _Object$assign.currency;

    assert.isInteger(amount);

    var globalLocale = Dinero.globalLocale,
        globalFormat = Dinero.globalFormat;

    /**
     * Uses ES5 function notation so `this` can be passed through call, apply and bind
     * @ignore
     */

    var create = function create(options) {
      var obj = Object.assign({}, Object.assign({}, { amount: amount, currency: currency }, options), Object.assign({}, { locale: this.locale }, options));
      return Object.assign(Dinero({ amount: obj.amount, currency: obj.currency }), {
        locale: obj.locale
      });
    };

    /**
     * Uses ES5 function notation so `this` can be passed through call, apply and bind
     * @ignore
     */
    var _hasSameCurrency = function _hasSameCurrency(comparator) {
      return this.getCurrency() === comparator.getCurrency();
    };

    return {
      /**
       * Returns the amount.
       *
       * @example
       * // returns 500
       * Dinero({ amount: 500 }).getAmount()
       *
       * @return {Number}
       */
      getAmount: function getAmount() {
        return amount;
      },

      /**
       * Returns the currency.
       *
       * @example
       * // returns 'EUR'
       * Dinero({ currency: 'EUR' }).getCurrency()
       *
       * @return {String}
       */
      getCurrency: function getCurrency() {
        return currency;
      },

      /**
       * Returns the locale.
       *
       * @example
       * // returns 'fr-FR'
       * Dinero().setLocale('fr-FR').getLocale()
       *
       * @return {String}
       */
      getLocale: function getLocale() {
        return this.locale || globalLocale;
      },

      /**
       * Returns a new Dinero object with an embedded locale.
       *
       * @param {String} newLocale - The new locale as an {@link http://tools.ietf.org/html/rfc5646 BCP 47 language tag}.
       *
       * @example
       * // Returns a Dinero object with locale 'ja-JP'
       * Dinero().setLocale('ja-JP')
       *
       * @return {Dinero}
       */
      setLocale: function setLocale(newLocale) {
        return create.call(this, { locale: newLocale });
      },

      /**
       * Returns a new Dinero object that represents the sum of this and an other Dinero object.
       *
       * @param {Dinero} addend - The Dinero object to add.
       *
       * @example
       * // returns a Dinero object with amount 600
       * Dinero({ amount: 400 }).add(Dinero({ amount: 200 }))
       *
       * @throws {TypeError} If `addend` has a different currency.
       *
       * @return {Dinero}
       */
      add: function add(addend) {
        assert.hasSameCurrency.call(this, addend);
        return create.call(this, {
          amount: calculator$1.add(this.getAmount(), addend.getAmount())
        });
      },

      /**
       * Returns a new Dinero object that represents the difference of this and an other Dinero object.
       *
       * @param  {Dinero} subtrahend - The Dinero object to subtract.
       *
       * @example
       * // returns a Dinero object with amount 200
       * Dinero({ amount: 400 }).subtract(Dinero({ amount: 200 }))
       *
       * @throws {TypeError} If `subtrahend` has a different currency.
       *
       * @return {Dinero}
       */
      subtract: function subtract(subtrahend) {
        assert.hasSameCurrency.call(this, subtrahend);
        return create.call(this, {
          amount: calculator$1.subtract(this.getAmount(), subtrahend.getAmount())
        });
      },

      /**
       * Returns a new Dinero object that represents the multiplied value by the given factor.
       *
       * [Banker's rounding](http://wiki.c2.com/?BankersRounding) is used to handle fractional cents.
       * This *can* lead to accuracy issues as you chain many times. Consider a minimal amount of subsequent calculations for safer results.
       *
       * @param  {Number} multiplier - The factor to multiply by.
       *
       * @example
       * // returns a Dinero object with amount 1600
       * Dinero({ amount: 400 }).multiply(4)
       * // returns a Dinero object with amount 800
       * Dinero({ amount: 400 }).multiply(2.001)
       *
       * @return {Dinero}
       */
      multiply: function multiply(multiplier) {
        return create.call(this, {
          amount: calculator$1.bankersRound(calculator$1.multiply(this.getAmount(), multiplier))
        });
      },

      /**
       * Returns a new Dinero object that represents the divided value by the given factor.
       *
       * [Banker's rounding](http://wiki.c2.com/?BankersRounding) is used to handle fractional cents.
       * This *can* lead to accuracy issues as you chain many times. Consider a minimal amount of subsequent calculations for safer results.
       *
       * @param  {Number} divisor - The factor to divide by.
       *
       * @example
       * // returns a Dinero object with amount 100
       * Dinero({ amount: 400 }).divide(4)
       * // returns a Dinero object with amount 52
       * Dinero({ amount: 105 }).divide(2)
       *
       * @return {Dinero}
       */
      divide: function divide(divisor) {
        return create.call(this, {
          amount: calculator$1.bankersRound(calculator$1.divide(this.getAmount(), divisor))
        });
      },

      /**
       * Returns a new Dinero object that represents a percentage of this.
       *
       * @param  {Number} percentage - The percentage to extract (between 0 and 100).
       *
       * @example
       * // returns a Dinero object with amount 5000
       * Dinero({ amount: 10000 }).percentage(50)
       *
       * @throws {RangeError} If `percentage` is out of range.
       *
       * @return {Dinero}
       */
      percentage: function percentage(_percentage) {
        assert.isPercentage(_percentage);
        return this.multiply(calculator$1.divide(_percentage, 100));
      },

      /**
       * Allocates the amount of a Dinero object according to a list of ratios.
       *
       * Sometimes you need to split monetary values but percentages can't cut it without adding or losing pennies.
       * A good example is invoicing: let's say you need to bill $1,000.03 and you want a 50% downpayment.
       * If you use {@link module:Dinero~percentage percentage}, you'll get an accurate Dinero object but the amount won't be billable: you can't split a penny.
       * If you round it, you'll bill a penny extra.
       * With {@link module:Dinero~allocate allocate}, you can split a monetary amount then distribute the remainder as evenly as possible.
       *
       * You can use percentage style or ratio style for `ratios`: `[25, 75]` and `[1, 3]` will do the same thing.
       *
       * @param  {Number[]} ratios - The ratios to allocate the money to.
       *
       * @example
       * // returns an array of two Dinero objects
       * // the first one with an amount of 502
       * // the second one with an amount of 501
       * Dinero({ amount: 1003 }).allocate([50, 50])
       * @example
       * // returns an array of two Dinero objects
       * // the first one with an amount of 25
       * // the second one with an amount of 75
       * Dinero({ amount: 100 }).allocate([1, 3])
       *
       * @throws {TypeError} If ratios are invalid.
       *
       * @return {Dinero[]}
       */
      allocate: function allocate(ratios) {
        var _this = this;

        assert.areValidRatios(ratios);

        var total = ratios.reduce(function (a, b) {
          return calculator$1.add(a, b);
        });
        var remainder = this.getAmount();

        var shares = ratios.map(function (ratio) {
          var share = Math.floor(calculator$1.divide(calculator$1.multiply(_this.getAmount(), ratio), total));
          remainder = calculator$1.subtract(remainder, share);
          return create.call(_this, { amount: share });
        });

        for (var i = 0; remainder > 0; i++) {
          shares[i] = shares[i].add(create.call(this, { amount: 1 }));
          remainder = calculator$1.subtract(remainder, 1);
        }

        return shares;
      },

      /**
       * Checks whether the value represented by this object equals to the other.
       *
       * @param  {Dinero} comparator - The Dinero object to compare to.
       *
       * @example
       * // returns true
       * Dinero({ amount: 500, currency: 'EUR' }).equalsTo(Dinero({ amount: 500, currency: 'EUR' }))
       * @example
       * // returns false
       * Dinero({ amount: 500, currency: 'EUR' }).equalsTo(Dinero({ amount: 800, currency: 'EUR' }))
       * @example
       * // returns false
       * Dinero({ amount: 500, currency: 'USD' }).equalsTo(Dinero({ amount: 500, currency: 'EUR' }))
       * @example
       * // returns false
       * Dinero({ amount: 500, currency: 'USD' }).equalsTo(Dinero({ amount: 800, currency: 'EUR' }))
       *
       * @return {Boolean}
       */
      equalsTo: function equalsTo(comparator) {
        return this.hasSameAmount(comparator) && this.hasSameCurrency(comparator);
      },

      /**
       * Checks whether the value represented by this object is less than the other.
       *
       * @param  {Dinero} comparator - The Dinero object to compare to.
       *
       * @example
       * // returns true
       * Dinero({ amount: 500 }).lessThan(Dinero({ amount: 800 }))
       * @example
       * // returns false
       * Dinero({ amount: 800 }).lessThan(Dinero({ amount: 500 }))
       *
       * @throws {TypeError} If `comparator` has a different currency.
       *
       * @return {Boolean}
       */
      lessThan: function lessThan(comparator) {
        assert.hasSameCurrency.call(this, comparator);
        return this.getAmount() < comparator.getAmount();
      },

      /**
       * Checks whether the value represented by this object is less than or equal to the other.
       *
       * @param  {Dinero} comparator - The Dinero object to compare to.
       *
       * @example
       * // returns true
       * Dinero({ amount: 500 }).lessThanOrEqual(Dinero({ amount: 800 }))
       * @example
       * // returns true
       * Dinero({ amount: 500 }).lessThanOrEqual(Dinero({ amount: 500 }))
       * @example
       * // returns false
       * Dinero({ amount: 500 }).lessThanOrEqual(Dinero({ amount: 300 }))
       *
       * @throws {TypeError} If `comparator` has a different currency.
       *
       * @return {Boolean}
       */
      lessThanOrEqual: function lessThanOrEqual(comparator) {
        assert.hasSameCurrency.call(this, comparator);
        return this.getAmount() <= comparator.getAmount();
      },

      /**
       * Checks whether the value represented by this object is greater than the other.
       *
       * @param  {Dinero} comparator - The Dinero object to compare to.
       *
       * @example
       * // returns false
       * Dinero({ amount: 500 }).greaterThan(Dinero({ amount: 800 }))
       * @example
       * // returns true
       * Dinero({ amount: 800 }).greaterThan(Dinero({ amount: 500 }))
       *
       * @throws {TypeError} If `comparator` has a different currency.
       *
       * @return {Boolean}
       */
      greaterThan: function greaterThan(comparator) {
        assert.hasSameCurrency.call(this, comparator);
        return this.getAmount() > comparator.getAmount();
      },

      /**
       * Checks whether the value represented by this object is greater than or equal to the other.
       *
       * @param  {Dinero} comparator - The Dinero object to compare to.
       *
       * @example
       * // returns true
       * Dinero({ amount: 500 }).greaterThanOrEqual(Dinero({ amount: 300 }))
       * @example
       * // returns true
       * Dinero({ amount: 500 }).greaterThanOrEqual(Dinero({ amount: 500 }))
       * @example
       * // returns false
       * Dinero({ amount: 500 }).greaterThanOrEqual(Dinero({ amount: 800 }))
       *
       * @throws {TypeError} If `comparator` has a different currency.
       *
       * @return {Boolean}
       */
      greaterThanOrEqual: function greaterThanOrEqual(comparator) {
        assert.hasSameCurrency.call(this, comparator);
        return this.getAmount() >= comparator.getAmount();
      },

      /**
       * Checks if the value represented by this object is zero.
       *
       * @example
       * // returns true
       * Dinero({ amount: 0 }).isZero()
       * @example
       * // returns false
       * Dinero({ amount: 100 }).isZero()
       *
       * @return {Boolean}
       */
      isZero: function isZero() {
        return this.getAmount() === 0;
      },

      /**
       * Checks if the value represented by this object is positive.
       *
       * @example
       * // returns false
       * Dinero({ amount: -10 }).isPositive()
       * @example
       * // returns true
       * Dinero({ amount: 10 }).isPositive()
       * @example
       * // returns true
       * Dinero({ amount: 0 }).isPositive()
       *
       * @return {Boolean}
       */
      isPositive: function isPositive() {
        return this.getAmount() >= 0;
      },

      /**
       * Checks if the value represented by this object is negative.
       *
       * @example
       * // returns true
       * Dinero({ amount: -10 }).isNegative()
       * @example
       * // returns false
       * Dinero({ amount: 10 }).isNegative()
       * @example
       * // returns false
       * Dinero({ amount: 0 }).isNegative()
       *
       * @return {Boolean}
       */
      isNegative: function isNegative() {
        return this.getAmount() < 0;
      },

      /**
       * Checks if this has cents.
       *
       * @example
       * // returns false
       * Dinero({ amount: 1100 }).hasCents()
       * @example
       * // returns true
       * Dinero({ amount: 1150 }).hasCents()
       *
       * @return {Boolean}
       */
      hasCents: function hasCents() {
        return calculator$1.modulo(this.getAmount(), 100) !== 0;
      },

      /**
       * Checks whether the currency represented by this object equals to the other.
       *
       * @param  {Dinero}  comparator - The Dinero object to compare to.
       *
       * @example
       * // returns true
       * Dinero({ amount: 2000, currency: 'EUR' }).hasSameCurrency(Dinero({ amount: 1000, currency: 'EUR' }))
       * @example
       * // returns false
       * Dinero({ amount: 1000, currency: 'EUR' }).hasSameCurrency(Dinero({ amount: 1000, currency: 'USD' }))
       *
       * @return {Boolean}
       */
      hasSameCurrency: function hasSameCurrency(comparator) {
        return _hasSameCurrency.call(this, comparator);
      },

      /**
       * Checks whether the amount represented by this object equals to the other.
       *
       * @param  {Dinero}  comparator - The Dinero object to compare to.
       *
       * @example
       * // returns true
       * Dinero({ amount: 1000, currency: 'EUR' }).hasSameAmount(Dinero({ amount: 1000 }))
       * @example
       * // returns false
       * Dinero({ amount: 2000, currency: 'EUR' }).hasSameAmount(Dinero({ amount: 1000, currency: 'EUR' }))
       *
       * @return {Boolean}
       */
      hasSameAmount: function hasSameAmount(comparator) {
        return this.getAmount() === comparator.getAmount();
      },

      /**
       * Returns this object formatted as a string.
       *
       * The format is a mask which defines how the output string will be formatted.
       * It defines whether to display a currency, in what format, how many fraction digits to display and whether to use grouping separators.
       * The output is formatted according to the applying locale.
       *
       * Object                       | Format            | String
       * :--------------------------- | :---------------- | :---
       * `Dinero({ amount: 500050 })` | `'$0,0.00'`       | $5,000.50
       * `Dinero({ amount: 500050 })` | `'$0,0'`          | $5,000
       * `Dinero({ amount: 500050 })` | `'$0'`            | $5000
       * `Dinero({ amount: 500050 })` | `'$0.0'`          | $5000.50
       * `Dinero({ amount: 500050 })` | `'USD0,0.0'`      | USD5,000.5
       * `Dinero({ amount: 500050 })` | `'0,0.0 dollar'`  | 5,000.5 dollars
       *
       * Don't try to substitute the `$` sign or the `USD` code with your target currency, nor adapt the format string to the exact format you want.
       * The format is a mask which defines a pattern and returns a valid, localized currency string.
       * If you want to display the object in a custom way, either use {@link module:Dinero~getAmount getAmount}, {@link module:Dinero~toUnit toUnit} or {@link module:Dinero~toRoundedUnit toRoundedUnit} and manipulate the output string as you wish.
       *
       * {@link module:Dinero~toFormat toFormat} is syntactic sugar over JavaScript's native `Number.prototype.toLocaleString` method, which you can use directly:
       * `Dinero().toRoundedUnit(precision).toLocaleString(locale, options)`.
       *
       * @param  {String} format - The format mask to format to.
       *
       * @example
       * // returns $2,000
       * Dinero({ amount: 200000 }).toFormat('$0,0')
       * @example
       * // returns €50.5
       * Dinero({ amount: 5050, currency: 'EUR' }).toFormat('$0,0.0')
       * @example
       * // returns 100 euros
       * Dinero({ amount: 10000, currency: 'EUR' }).setLocale('fr-FR').toFormat('0,0 dollar')
       * @example
       * // returns 2000
       * Dinero({ amount: 200000, currency: 'EUR' }).toFormat()
       *
       * @return {String}
       */
      toFormat: function toFormat(format) {
        var formatter = Format(format || globalFormat);

        return this.toRoundedUnit(formatter.getMinimumFractionDigits()).toLocaleString(this.getLocale(), {
          currencyDisplay: formatter.getCurrencyDisplay(),
          useGrouping: formatter.getUseGrouping(),
          minimumFractionDigits: formatter.getMinimumFractionDigits(),
          style: formatter.getStyle(),
          currency: this.getCurrency()
        });
      },

      /**
       * Returns the amount represented by this object in units.
       *
       * @example
       * // returns 10.5
       * Dinero({ amount: 1050 }).toUnit()
       *
       * @return {Number}
       */
      toUnit: function toUnit() {
        return calculator$1.divide(this.getAmount(), 100);
      },

      /**
       * Returns the amount represented by this object in rounded units.
       *
       * @example
       * // returns 10.6
       * Dinero({ amount: 1055 }).toRoundedUnit(1)
       *
       * @param  {Number} precision - The number of fraction digits to round to.
       * @return {Number}
       */
      toRoundedUnit: function toRoundedUnit(precision) {
        var factor = Math.pow(10, precision);

        return calculator$1.divide(calculator$1.multiply(Math.sign(this.toUnit()), Math.round(Math.abs(calculator$1.multiply(this.toUnit(), factor)))), factor);
      },

      /**
       * Return the object's data as an object literal.
       *
       * @example
       * // returns { amount: 500, currency: 'EUR' }
       * Dinero({ amount: 500, currency: 'EUR' }).toObject()
       *
       * @return {Object}
       */
      toObject: function toObject() {
        return {
          amount: amount,
          currency: currency
        };
      }
    };
  };

  var dinero = Object.assign(Dinero, Defaults, Globals);

  return dinero;

})));
