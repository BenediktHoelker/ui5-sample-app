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
				const todos = model.getProperty('/todos').map((oTodo) => ({ ...oTodo }));

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
				const oModel = this.getView().getModel();
				const aTodos = oModel.getProperty('/todos').map((oTodo) => ({ ...oTodo }));

				let i = aTodos.length;

				while (i--) {
					const oTodo = aTodos[i];
					if (oTodo.completed) {
						aTodos.splice(i, 1);
					}
				}

				oModel.setProperty('/todos', aTodos);
			},

			/**
			 * Updates the number of items not yet completed
			 */
			updateItemsLeftCount() {
				const oModel = this.getView().getModel();
				const aTodos = oModel.getProperty('/todos') || [];

				const iItemsLeft = aTodos.filter((oTodo) => oTodo.completed !== true).length;

				oModel.setProperty('/itemsLeftCount', iItemsLeft);
			},

			/**
			 * Trigger search for specific items. The removal of items is disable as long as the search is used.
			 * @param {sap.ui.base.Event} oEvent Input changed event
			 */
			onSearch(oEvent) {
				const oModel = this.getView().getModel();

				// First reset current filters
				this._searchFilters = [];

				// add filter for search
				this.sSearchQuery = oEvent.getSource().getValue();
				if (this.sSearchQuery && this.sSearchQuery.length > 0) {
					oModel.setProperty('/itemsRemovable', false);
					const filter = new Filter('title', FilterOperator.Contains, this.sSearchQuery);
					this._searchFilters.push(filter);
				} else {
					oModel.setProperty('/itemsRemovable', true);
				}

				this._applyListFilters();
			},

			onFilter(oEvent) {
				// First reset current filters
				this._tabFilters = [];

				// add filter for search
				this.sFilterKey = oEvent.getParameter('item').getKey();

				// eslint-disable-line default-case
				switch (this.sFilterKey) {
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
				const oList = this.byId('todoList');
				const oBinding = oList.getBinding('items');

				oBinding.filter(this._searchFilters.concat(this._tabFilters), 'todos');

				let sI18nKey;
				if (this.sFilterKey && this.sFilterKey !== 'all') {
					if (this.sFilterKey === 'active') {
						sI18nKey = 'ACTIVE_ITEMS';
					} else {
						// completed items: sFilterKey = "completed"
						sI18nKey = 'COMPLETED_ITEMS';
					}
					if (this.sSearchQuery) {
						sI18nKey += '_CONTAINING';
					}
				} else if (this.sSearchQuery) {
					sI18nKey = 'ITEMS_CONTAINING';
				}

				let sFilterText;
				if (sI18nKey) {
					const oResourceBundle = this.getView().getModel('i18n').getResourceBundle();
					sFilterText = oResourceBundle.getText(sI18nKey, [this.sSearchQuery]);
				}

				this.getView().getModel('view').setProperty('/filterText', sFilterText);
			}
		})
);
