!function ($) {

	/**
	 * A Simple way to send Form data via Ajax 
	 * @example
	 * $('#form').form3bits();
	 * $('#form').form3bits('desactivate');
	 * $('#form2').form3bits({
	 *   onSuccess: function (data, textStatus, jqXHR) { alert('ok'); }
	 * });
	 * @class Form3bits
	 */
	var Form3bits = function(element, options) {
		this.$element = $(element)
		this.$elements = $('input[type!="submit"], textarea, select', this.$element)
		this.$button = $('[type="submit"]', this.$element)
		this.$element.on('submit', $.proxy(this.submit, this))
    	this.options = $.extend({}, $.fn.form3bits.defaults, options)
	}

	/**
	 * Form Submit Event Handler
	 * @param e jQuery Submit Event
	 * @returns {Object} The Form3bits Instance
	 */
	Form3bits.prototype.submit = function(e) {
		e.preventDefault()

		if (!this.isEmpty())
			this.send()
		else 
			this.onEmpty()
		return this
	}

	/**
	 * Send form data
	 * @returns {Object} The Form3bits Instance
	 */
	Form3bits.prototype.send = function() {
		if ($.isFunction(this.options.onSend))
			return this.options.onSend.apply(this);

		var data = ($.isFunction(this.options.onValues)) ? this.options.onValues.apply(this) : this.values()

		this.desactivate().changeButton(true)
		$.ajax({
			url: this.$element.attr('action'),
			type: this.$element.attr('method'),
			dataType: this.options.dataType,
			data: data,
			success: $.proxy(this.onSuccess, this),
			error: $.proxy(this.onError, this)
		})
		return this
	}

	/**
	 * If is empty, this function is called
	 */
	Form3bits.prototype.onEmpty = function() {
		if ($.isFunction(this.options.onEmpty))
			return this.options.onEmpty.apply(this);

		alert(this.options.text.empty)
	}

	/**
	 * If is successed, this function is called
	 * @param data 
	 * @param textStatus 
	 * @param jqXHR 
	 */
	Form3bits.prototype.onSuccess = function(data, textStatus, jqXHR) {
		if ($.isFunction(this.options.onSuccess))
			return this.options.onSuccess.apply(this, [data, textStatus, jqXHR]);

		this.activate().clear().changeButton(false)
		alert(this.options.text.success)
	}

	/**
	 * If it has an error, this function is called
	 * @param jqXHR 
	 * @param textStatus 
	 * @param errorThrown 
	 */
	Form3bits.prototype.onError = function(jqXHR, textStatus, errorThrown) {
		if ($.isFunction(this.options.onError))
			return this.options.onError.apply(this, [jqXHR, textStatus, errorThrown]);

		this.activate().changeButton(false)
		alert(this.options.text.error)
	}

	/**
	 * Check if all required fields are empty
	 * @returns {Boolean} Is empty?
	 */
	Form3bits.prototype.isEmpty = function() {
		if (!this.$elements.length)
			return true

		var empty = false
		this.$elements.each(function(i, input){
			var $input = $(input)
			if ($input.attr('require') && '' == $.trim($input.val()))
				return empty = true;
		})
		return empty
	}

	/**
	 * Return all form fields values
	 * @returns {Array} The Form data
	 */
	Form3bits.prototype.values = function() {
		var data = {}
		this.$elements.each(function(i, el){
			var $el = $(el)
			if ($el.is(':checkbox'))
				data[ $el.attr('name') ] = $el.is(':checked') ? $el.val() : null;
			else
				data[ $el.attr('name') ] = $el.val()
		})
		return data
	}

	/**
	 * Clear a form
	 * @returns {Object} The Form3bits Instance
	 */
	Form3bits.prototype.clear = function() {
		this.$elements
			.val('')
			.find('option:selected').removeAttr('selected')
			.end()
			.filter(':checked').removeAttr('checked')
		return this
	}

	/**
	 * Active or desactivate a form
	 * @param active Is to activate?
	 * @returns {Object} The Form3bits Instance
	 */
	Form3bits.prototype.setState = function(active) {
		active = active == undefined || !!active;
		if ($.isFunction(this.options.onSetState))
			return this.options.onSetState.apply(this, [active]);

		this.$elements.attr('disabled', !active)
		this.$button.attr('disabled', !active)
		return this
	}

	/**
	 * Change button state
	 * @param active Is to activate?
	 * @returns {Object} The Form3bits Instance
	 */
	Form3bits.prototype.changeButton = function(active) {
		if ($.isFunction(this.options.onChangeButton))
			return this.options.onChangeButton.apply(this, [active]);

		var buttonText = this.$button.data('text')
		  , isButton = this.$button.is(':button')
		  , label

		if (!buttonText) {
			buttonText = isButton ? this.$button.text() : this.$button.val()
			this.$button.data('text', buttonText)
		}

		label = !active ? buttonText : this.options.text.sending
		if (isButton) this.$button.text(label); else this.$button.val(label)

		return this
	}

	/**
	 * Activate form
	 * @returns {Object} The Form3bits Instance
	 */
	Form3bits.prototype.activate = function() {
		return this.setState(true)
	}

	/**
	 * Desactivate form
	 * @returns {Object} The Form3bits Instance
	 */
	Form3bits.prototype.desactivate = function() {
		return this.setState(false)
	}

	/**
	 * Destroy the reference of Form3bits
	 */
	Form3bits.prototype.destroy = function() {
		if ($.isFunction(this.options.onDestroy))
			return this.options.onDestroy.apply(this);
		this.$element.off('submit').removeData('form3bits')
	}

	/**
	 *	jQuery Plugin
	 */
	$.fn.form3bits = function (option) {
		var action = typeof option == 'string' && option
		  , result = []
		  , loop
		  , length

		loop = this.each(function () {
			var $this = $(this)
			  , data = $this.data('form3bits')
			  , options = typeof option == 'object' && option

			if (!data) $this.data('form3bits', (data = new Form3bits(this, options)))
      		if (action && data[action]) {
      			var fnResult = data[action].apply(data, Array.prototype.slice.call(arguments, 1))
      			result.push(fnResult)
      		}
		})

		length = result.length
		return !length ? loop : (length == 1 ? result[0] : result);
	}

	/**
	 *	Defaults
	 */
	$.fn.form3bits.defaults = {
		text:	{
			'success': 'Your data has been successfully saved'
		  ,	'error': 'An error occurred. Please, try again'
		  ,	'empty': 'Please, fill in all required fields'
		  ,	'sending': 'Sending...'
		}
	  , dataType: 'json'

	  , onEmpty: null
	  ,	onError: null
	  ,	onSuccess: null
	  , onSend: null
	  , onValues: null
	  , onSetState: null
	  , onChangeButton: null
	  , onDestroy: null
	}

}(window.jQuery);