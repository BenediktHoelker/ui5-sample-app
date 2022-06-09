sap.ui.define(
	[
		'sap/ui/Device',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/ui/model/json/JSONModel'
	],
	(Device, Controller, Filter, FilterOperator, JSONModel) =>
		Controller.extend('sap.ui.demo.todo.controller.App', {
			onInit() {
				this._searchFilters = [];
				this._tabFilters = [];

				this.getView().setModel(
					new JSONModel({
						isMobile: Device.browser.mobile,
						filterText: undefined
					}),
					'view'
				);
			},

			/**
			 * Adds a new todo item to the bottom of the list.
			 */
			addTodo() {
				const model = this.getView().getModel();
				const todos = model.getProperty('/todos').map((todo) => ({ ...todo }));

				todos.push({
					title: model.getProperty('/newTodo'),
					completed: false
				});

				model.setProperty('/todos', todos);
				model.setProperty('/newTodo', '');
			},

			/**
			 * Removes all completed items from the todo list.
			 */
			clearCompleted() {
				const model = this.getView().getModel();
				const todos = model.getProperty('/todos').filter(({ completed }) => !completed);

				model.setProperty('/todos', todos);
			},

			/**
			 * Updates the number of items not yet completed
			 */
			updateItemsLeftCount() {
				const model = this.getView().getModel();
				const todos = model.getProperty('/todos') || [];
				const itemsLeft = todos.filter(({ completed }) => !completed).length;

				model.setProperty('/itemsLeftCount', itemsLeft);
			},

			/**
			 * Trigger search for specific items. The removal of items is disable as long as the search is used.
			 * @param {sap.ui.base.Event} event Input changed event
			 */
			onSearch(event) {
				const model = this.getView().getModel();

				// First reset current filters
				this._searchFilters = [];

				// add filter for search
				this._searchQuery = event.getSource().getValue();

				if (this._searchQuery && this._searchQuery.length > 0) {
					model.setProperty('/itemsRemovable', false);
					const filter = new Filter('title', FilterOperator.Contains, this._searchQuery);
					this._searchFilters.push(filter);
				} else {
					model.setProperty('/itemsRemovable', true);
				}

				this._applyListFilters();
			},

			onFilter(event) {
				// First reset current filters
				this._tabFilters = [];

				// add filter for search
				this._filterKey = event.getParameter('item').getKey();

				// eslint-disable-line default-case
				switch (this._filterKey) {
					case 'active':
						this._tabFilters.push(new Filter('completed', FilterOperator.EQ, false));
						break;
					case 'completed':
						this._tabFilters.push(new Filter('completed', FilterOperator.EQ, true));
						break;
					case 'all':
					default:
					// Don't use any filter
				}

				this._applyListFilters();
			},

			_applyListFilters() {
				const list = this.byId('todoList');
				const listBinding = list.getBinding('items');

				listBinding.filter(this._searchFilters.concat(this._tabFilters), 'todos');

				let i18nKey;
				if (this._filterKey && this._filterKey !== 'all') {
					if (this._filterKey === 'active') {
						i18nKey = 'ACTIVE_ITEMS';
					} else {
						// completed items: sFilterKey = "completed"
						i18nKey = 'COMPLETED_ITEMS';
					}
					if (this._searchQuery) {
						i18nKey += '_CONTAINING';
					}
				} else if (this._searchQuery) {
					i18nKey = 'ITEMS_CONTAINING';
				}

				let filterText;
				if (i18nKey) {
					const resBundle = this.getView().getModel('i18n').getResourceBundle();
					filterText = resBundle.getText(i18nKey, [this._searchQuery]);
				}

				this.getView().getModel('view').setProperty('/filterText', filterText);
			}
		})
);
