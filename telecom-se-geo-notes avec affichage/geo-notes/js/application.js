//NotesApp est une fonction anonyme dont le rôle est d'isoler nos tratiements des autres scripts (jquery, backbone...)
var NotesApp = (function(){
	
	//Nom : App-----------------------------------------------------------------------
	//Role : Contient l'application. App est retourné à la fin de l'exécution de App
	var App = {
		stores: {},
		views: {},
		collections: {}
	};
	
	//On initilise la base de données, appellée "store"
	App.stores.notes = new Store('notes');

	//Nom : Note----------------------------------------------------------------------
	//Role : Classe qui hérite de Backbone.Model et la surcharge
	//		 Cette classe décrit la manière dont est stockée une note
	//		 Une note est composée d'un titre (title) et d'un contenu (body)
	var Note = Backbone.Model.extend({
		//Use localStorage datastore
		localStorage: App.stores.notes,

		initialize: function(){
			console.log('Note : initialize')
			if (!this.get('title')) {//On récupère le titre de la note à l'aide du label "title" dans le formulaire
				this.set({title: "Note @ " + Date()})
			};

			if (!this.get('body')) {//On récupère le contenu de la note à l'aide du label "body" dans le formulaire
				this.set({body: "No Content"})
			};
		}
	});
	
	//Nom : NoteList------------------------------------------------------------------
	//Role : Classe qui hérite de Backbone.Collection et la surchage
	//		 L'objet instancié à partir de cette classe est une collection de notes
	var NoteList = Backbone.Collection.extend({ 
		// This collection is composed of Note objects    
		model: Note,
		
		// Set the localStorage datastore   
		localStorage: App.stores.notes,
		
		initialize: function(){  
			console.log('NoteList : initialize');
			var collection = this;	//On conserve le contexte (NoteList)	  
   
			this.localStorage.bind('update', function(){	//Quand on capte l'évènement 'update' qui apparait à la création d'une nouvelle note est créée
				collection.fetch();	//Mise à jour de la collection NoteList avec la nouvelle entrée
				console.log('collection fetched');
		  });
		}
		
	});

	//Nom : NewNoteForm---------------------------------------------------------------
	//Role : Classe qui hérite de Backbone.View et la surcharge
	//		 Cette classe défini les actions à accomplir lors de la création d'une nouvelle note
	//		 L'objet instancié à partir de cette classe capte l'évènement de la création d'une note,
	//		 crée une nouvelle note et la sauvergarde
	var NewNoteForm = Backbone.View.extend({
		
		events: { //On souaite capter l'évènement "soumettre une note"
			"submit form" : "createNote"  	//Synthaxe particulière de Backbone : On lie l'évènement "submit" de l'élément de l'arbre DOM "form" à la fonction "createNote"
		},

		createNote: function(event){ //La fonction createNote prend comme paramètre l'évènement qui l'a appelée (submit en l'occurence)
			console.log('Create Note');
			
			var attrs = this.getAttributes(); //Les attributs de la note (Titre et Contenu) sont stockés dans attrs
			var note = new Note();

			note.set(attrs); //Puis les attribus sont sauvegardés dans une nouvelle note
			note.save();

			//Par défaut le web browser soumet le formulaire, à l'aide de la commande suivante on sort de ce mode par défaut
			event.preventDefault();

			//Stop le bublling de notre code
			event.stopPropagation();

			//Ferme la boite de dialogue
			$('.ui-dialog').dialog('close');
			
			//Vide les champs du formulaire
			this.reset();
		},
		
		//Fonction qui récupère les attributs de la note
		getAttributes: function(){
			return {
				title: this.$('form [name="title"]').val(),
				body: this.$('form [name="body"]').val()
			};
		},
		
		//Vide les champs du formulaire
		reset: function() {
			this.$('input, textarea').val('');
		}

	});

	//Nom : NoteListView--------------------------------------------------------------
	//Role : Cette classe met à jour l'affichage des notes sur la page html
	//		 Quand la collection est modifiée, les notes sont affichées sur la page sans que l'utilisateur doive la rafraichir manuellement
	// 		 Represents a listview page displaying a collection of Notes
	// 		 Each item is represented by a NoteListItemView
	var NoteListView = Backbone.View.extend({
	
		initialize: function(){
			console.log('NoteListView : initialize');
			_.bindAll(this, 'addOne', 'addAll'); //._bindAll est une méthode de underscore. On lie le contexte (NoteListView) avec les 
											   //évènements addOne et addAll (évènements définis plus bas)
		  
			this.collection.bind('add', this.addOne);  	//on lie l'évènement 'add' généré par backbone à la fonction 'addOne' 
			this.collection.bind('refresh', this.addAll);	//on lie l'évènement 'refresh' à la fonction 'addAll'
		  
			this.collection.fetch();
			console.log('NoteListView : initialize end');
		},
		
		//Le problème est que l'évènement n'est pas lancé/capté
		addOne: function(note){
			console.log('addOne');
			var view = new NoteListItemView({model: note});
			$(this.el).append(view.render().el);
			
			if('mobile' in $){
				$(this.el).listview().listview('refresh');
			}
		},
		
		addAll: function(){
			console.log('addAll');
			$(this.el).empty();
			this.collection.each(this.addOne);
		}
	
	
	});
	
	//Nom : NoteListItemView----------------------------------------------------------
	//Role : 
	var NoteListItemView = Backbone.View.extend({
		tagName: 'LI',
		template: _.template($('#note-list-item-template').html()),
		
		initialize: function(){
			console.log('NoteListViewItem : initialize');
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
		},
		
		render: function(){
			console.log('NoteListItemView : render');
			$(this.el).html(this.template({ note: this.model }));
			return this;
		}
		
	});
	
	//Main----------------------------------------------------------------------------
	
	$(document).ready(function(){
		// Executed only when the DOM is ready, e.g. the html page is loaded
		App.views.newForm = new NewNoteForm({
			el: $('#NouvelleNote')
		});
	});
	
	window.Note = Note;
	  
	App.collections.all_notes = new NoteList()
	  
	App.views.new_form = new NewNoteForm({
		el: $('#NouvelleNote')
	});
	
	App.views.list_alphabetical = new NoteListView({
		el: $('#all_notes'),
		collection: App.collections.all_notes
	});
 
	return App;

})();