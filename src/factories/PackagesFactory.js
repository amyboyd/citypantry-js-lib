angular.module('cpLib').factory('PackagesFactory',
        function(ApiService, getPackagingTypeTextFilter, getPackagingTypeChoiceTextFilter,
        getPackageDispositionTextFilter) {
    return {
        getAllPackages: () => ApiService.get(`/packages`),

        getPackage: id => ApiService.get(`/packages/${id}`),

        getPackageByHumanId: humanId => ApiService.get(`/packages/${humanId}`),

        /**
         * Resolves to the name of a package.
         *
         * @param {String|Number} id Either the package ID or the package human ID.
         */
        getPackageName: (id) => ApiService.get(`/packages/${id}`)
            .then(response => response.data.name),

        createPackage: packageDetails => ApiService.post(`/packages`, packageDetails),

        updatePackage: (id, updatedPackage) => ApiService.put(`/packages/${id}`, updatedPackage),

        deletePackage: id => ApiService.delete(`/packages/${id}`),

        /**
         * @param {Promise} timeoutPromise Optional promise that is passed to the $http service as
         *                                  it's `timeout` config option. This is used to cancel a
         *                                  search if a new search request is started before the
         *                                  previous request returns.
         */
        searchPackages(name = '', postcode = '', maxBudget = '', headCount = '', time = '', date = '',
                eventTypeIds = [], cuisineTypeIds = [], dietaryRequirementIds = [], packagingType = '',
                timeoutPromise = undefined) {
            let url = `/packages/search?name=${name}&postcode=${postcode}` +
                `&maxBudget=${maxBudget}&headCount=${headCount}&time=${time}&date=${date}&packagingType=${packagingType}`;

            eventTypeIds.forEach(eventTypeId => {
                url += `&eventTypeIds[]=${eventTypeId}`;
            });

            cuisineTypeIds.forEach(cuisineTypeId => {
                url += `&cuisineTypeIds[]=${cuisineTypeId}`;
            });

            dietaryRequirementIds.forEach(dietaryRequirementId => {
                url += `&dietaryRequirementIds[]=${dietaryRequirementId}`;
            });

            return ApiService.get(url, {timeout: timeoutPromise});
        },

        getPackagesByVendor: id => ApiService.get(`/packages/search/all?vendorId=${id}`),

        getPackagesByCurrentVendor: () => ApiService.get(`/packages/by-current-vendor`),

        getPackageReviews: id => ApiService.get(`/reviews/package/${id}`),

        getSimilarPackages: id => ApiService.get(`/packages/${id}/similar`),

        approvePackage: (id) => ApiService.put(`/packages/${id}/approve`),

        getAllergenTypes: () => ApiService.get(`/allergen-types`),

        getDietaryTypes: () => ApiService.get(`/dietary-requirements`),

        getEventTypes: () => ApiService.get(`/event-types`),

        getCuisineTypes: () => ApiService.get(`/cuisine-types`),

        getDeliveryDayOptions: () => {
            return [
                { label: 'Monday',    value: 'Monday' },
                { label: 'Tuesday',   value: 'Tuesday' },
                { label: 'Wednesday', value: 'Wednesday' },
                { label: 'Thursday',  value: 'Thursday' },
                { label: 'Friday',    value: 'Friday' },
                { label: 'Saturday',  value: 'Saturday' },
                { label: 'Sunday',    value: 'Sunday' }
            ];
        },

        /**
         * Gets an array of possible notice options for a package.
         *
         * @return {Array}
         */
        getNoticeOptions: () => {
            return [
                { label: '1 hour',   value: 1 },
                { label: '2 hours',  value: 2 },
                { label: '3 hours',  value: 3 },
                { label: '4 hours',  value: 4 },
                { label: '5 hours',  value: 5 },
                { label: '6 hours',  value: 6 },
                { label: '12 hours', value: 12 },
                { label: '18 hours', value: 18 },
                { label: '24 hours', value: 24 },
                { label: '36 hours', value: 36 },
                { label: '2 days',   value: 48 },
                { label: '3 days',   value: 72 },
                { label: '4 days',   value: 96 },
                { label: '5 days',   value: 120 },
                { label: '6 days',   value: 144 },
                { label: '7 days',   value: 168 },
                { label: '14 days',  value: 336 }
            ];
        },

        getQuantityOptions: () => {
            var i = 1;
            var step = 1;

            const options = [];

            while (i <= 6000) {
                options.push(i);

                if (30 <= i && i < 100) {
                    step = 5;
                } else if (100 <= i && i < 500) {
                    step = 25;
                } else if (500 <= i && i < 1000) {
                    step = 50;
                } else if (i >= 1000) {
                    step = 500;
                }

                i += step;
            }

            return options;
        },

        getRadiusOptions: () => {
            const options = [];

            for (let i = 1, step = 1; i <= 50; i += step) {
                options.push({
                    label: i + ' mile radius',
                    value: i
                });
                if (i === 5) {
                    step = 5;
                }
            }

            return options;
        },

        getPackagingTypeOptions: () => {
            return [1, 2, 3, 4, 5].map(value => ({ value, label: getPackagingTypeTextFilter(value) }));
        },

        getPackagingTypeChoiceOptions: () => {
            return [1, 2, 3].map(value => ({ value, label: getPackagingTypeChoiceTextFilter(value) }));
        },

        /**
         * The 'start' and 'end' parameters should be the time in 24-hour clock as an integer,
         * e.g. 730 for 07:30, or 2330 for 23:30.
         *
         * @param  {Number} start
         * @param  {Number} end
         * @param  {Number} interval
         * @return {Array}
         */
        getPackageDeliveryTimeOptions: (start, end, interval = 15) => {
            let startMinutes = (Math.floor(start / 100) * 60) + (start % 100);
            let endMinutes = (Math.floor(end / 100) * 60) + (end % 100);

            const options = [];

            while (startMinutes <= endMinutes) {
                const hour = ('0' + Math.floor(startMinutes / 60)).slice(-2);
                const minute = ('0' + startMinutes % 60).slice(-2);

                options.push({
                    label: hour + ':' + minute,
                    value: parseInt(hour + minute, 10)
                });

                startMinutes += interval;
            }

            return options;
        },

        checkIfPackageCanBeDeliveredToPostcode: (id, postcode) => ApiService.get(`/packages/${id}/availability?postcode=${postcode}`),

        checkIfPackageCanBeDelivered: (id, date, time, postcode, headCount) => ApiService.get(`/packages/${id}/availability?date=${date}&time=${time}&postcode=${postcode}&headCount=${headCount}`),

        getRecommendedPackage: () => ApiService.get(`/packages/one-recommended`),

        getPackageDispositionOptions: () => {
            return [1, 2].map(value => ({ value, label: getPackageDispositionTextFilter(value) }));
        }
    };
});
