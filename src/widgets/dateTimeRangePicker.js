
/**
* dateTimeRangePicker Widget
*
* This widget allows for the use of checkboxes and radio boxes alongside formBuilder
*
* Public Methods:
*   setRange()
*   serializeDate()
*	 deserializeDate()
*   get()
*   set()
*   isDirty()
*   clearDirty()
*   clear()
*   validate()
*/
import $ from 'jquery';
import moment from 'moment';

const dict = {};

$.widget('formBuilder.dateTimeRangePicker', {
	_dateTimeRangePickerTemplate:
			'<div class="date-range-picker form">' +
				'<input type="text" name="from" data-type="dateTime" data-label="'+dict.from+'"/>' +
				'<input type="text" name="to" data-type="dateTime" data-label="'+dict.to+'"/>' +

				'<button type="button" class="previous-range">&lt;&lt;</button>' +

				'<div class="input-field-group range-select">' +
					'<select name="range" style="width: 138px;">' +
						'<option value="custom">'+dict.custom+'</option>' +
						'<option value="day">'+dict.day+'</option>' +
						'<option value="week">'+dict.week+'</option>' +
						'<option value="month">'+dict.month+'</option>' +
						'<option value="year">'+dict.year+'</option>' +
					'</select>' +
				'</div>' +

				'<button type="button" class="next-range">&gt;&gt;</button>' +
			'</div>',
			
	_create: function () {
		const self = this,
			e = self.element;

		const form = self.form = $('<div></div>').html(self._dateTimeRangePickerTemplate).find('.date-range-picker').formBuilder();

		e.append(form);

		self.fromDate = form.find('input[name="from"]').on('keyup ondateselect', function () {
			$(self.range).val('custom');
		});
		// self.fromDate.inputField('setLabel', e.attr('data-from-label'));

		self.toDate = form.find('input[name="to"]').on('keyup ondateselect', function () {
			$(self.range).val('custom');
		});
		// self.toDate.inputField('setLabel', e.attr('data-to-label'));

		form.find('button.previous-range').button().on('click', function () {
			self._moveRange(-1, $(self.range).val());
		});

		form.find('button.next-range').button().on('click', function () {
			self._moveRange(1, $(self.range).val());
		});

		self.range = form.find('select[name="range"]').on('change', function () {
			self.setRange($(this).val());
		});
	},

	_moveRange: function (number, unit) {
		const self = this,
			fromTypeInstance = self.fromDate.inputField('getType'),
			toTypeInstance = self.toDate.inputField('getType');

		if (fromTypeInstance.dateWidgetInstance.isEmpty() || unit === 'custom') {
			return;
		}

		const fromDate = self.deserializeDate(fromTypeInstance.dateWidgetInstance.get());

		const begin = fromDate.add(number, unit);
		const end = moment(begin).add(1,unit).subtract(1,'day');

		fromTypeInstance.dateWidgetInstance.set(self.serializeDate(begin));
		toTypeInstance.dateWidgetInstance.set(self.serializeDate(end));

		// Force times to be correct in regards to DST
		if(fromTypeInstance.timeWidgetInstance.isEmpty()) {
			fromTypeInstance.timeWidgetInstance.set(moment().hours(0).minutes(0).utc().format('HH:mm'));
		}
		
		if(toTypeInstance.timeWidgetInstance.isEmpty()) {
			toTypeInstance.timeWidgetInstance.set(moment().hours(23).minutes(59).utc().format('HH:mm'));
		}
	},

	setRange: function (range) {
		const self = this,
			fromTypeInstance = self.fromDate.inputField('getType'),
			toTypeInstance = self.toDate.inputField('getType');
		
		let fromDate;

		if (range === 'custom') {
			return;
		}

		fromDate = fromTypeInstance.dateWidgetInstance.get();

		if (!fromDate) {
			fromDate = moment();
		}

		if (typeof fromDate === 'string') {
			fromDate = self.deserializeDate(fromDate);
		}
					

		const from = fromDate.startOf(range);
		const to = moment(from).endOf(range);

		fromTypeInstance.dateWidgetInstance.set(self.serializeDate(from));
		toTypeInstance.dateWidgetInstance.set(self.serializeDate(to));

		// Force times to be correct in regards to DST
		if(fromTypeInstance.timeWidgetInstance.isEmpty()) {
			fromTypeInstance.timeWidgetInstance.set(moment().hours(0).minutes(0).utc().format('HH:mm'));
		}
		
		if(toTypeInstance.timeWidgetInstance.isEmpty()) {
			toTypeInstance.timeWidgetInstance.set(moment().hours(23).minutes(59).utc().format('HH:mm'));
		}

		self.range.val(range);
	},

	serializeDate: function (momentDate) {
		if (!momentDate) {
			return;
		}

		return momentDate.format('YYYY-MM-DD');
	},

	deserializeDate: function (stringDate) {
		if (!stringDate) {
			return;
		}

		return moment(stringDate, 'YYYY-MM-DD');
	},

	get: function () {
		const self = this;

		return self.form.formBuilder('get');
	},

	set: function (data) {
		const self = this;

		self.form.formBuilder('set', data);
	},

	isDirty: function () {
		return this.form.formBuilder('isDirty');
	},

	clearDirty: function () {
		const self = this;

		self.form.formBuilder('clearDirty');
	},

	clear: function () {
		const self = this;

		self.set({
			from: '',
			to: '',
			range: 'custom'
		});
	},

	validate: function () {
		const self = this,
			form = self.form;

		if (!form.formBuilder('validate')) {
			return false;
		}
	}
});
