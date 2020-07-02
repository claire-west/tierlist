(function(dynCore, hashNav) {
    dynCore.when(
        dynCore.require('hub.appHub'),
        dynCore.require([
            'indexer',
            'globalModel',
            'arraySort'
        ], 'lib')
    ).done(function(modules, appHub, indexer) {
        appHub('app', {
            model: {
                tierlists: {},

                addScores: function(scores) {
                    var sum = 0;
                    for (var i = 0; i < scores.length; i++) {
                        sum += scores[i].score;
                    }
                    return sum;
                }
            },

            onInit: function() {
                var self = this;
                this.model.getGrade = function(scores) {
                    var sum = self.model.addScores(scores);
                    return self.model.currentTierlist.grades[sum];
                }
            },

            load: function(listName) {
                if (this.model.tierlists[listName]) {
                    this.model._set('currentTierlist', this.model.tierlists[listName]);
                    return $.when();
                }

                var self = this;
                var promise = $.Deferred();
                $.ajax('app/json/tierlists/' + listName.toLocaleLowerCase() + '.json').done(function(data) {
                    data.items.sort(function(a, b) {
                        var aVal = self.model.addScores(a.scores);
                        var bVal = self.model.addScores(b.scores);
                        return bVal - aVal;
                    });
                    self.model.tierlists[listName] = data;
                    self.model._set('currentTierlist', self.model.tierlists[listName]);
                    promise.resolve(data);
                }).fail(function() {
                    promise.reject();
                });
                console.log(self.model)
                return promise;
            },

            onNav: {
                '': function() {
                    this.load('Warframes');
                }
            },
        });
    });
})(window.dynCore, window.hashNav);