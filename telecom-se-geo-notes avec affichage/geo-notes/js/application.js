//NotesApp est une fonction anonyme dont le r�le est d'isoler nos tratiements des autres scripts (jquery, backbone...)
var NotesApp = (function(){
	
	//Nom : App-----------------------------------------------------------------------
	//Role : Contient l'application. App est retourn� � la fin de l'ex�cution de App
	var App = {
		stores: {},
		views: {},
		collections: {}
	};
	
	//On initilise la base de donn�es, appell�e "store"
	App.stores.notes = new Store('notes');

	//Nom : Note----------------------------------------------------------------------
	//Role : Classe qui h�rite de Backbone.Model et la surcharge
	//		 Cette classe d�crit la mani�re dont est stock�e une note
	//		 Une note est compos�e d'un titre (title) et d'un contenu (body)
	var Note = Backbone.Model.extend({
		//Use localStorage datastore
		localStorage: App.stores.notes,

		initialize: function(){
			console.log('Note : initialize')
			if (!this.get('title')) {//On r�cup�re le titre de la note � l'aide du label "title" dans le formulaire
				this.set({title: "Note @ " + Date()})
			};

			if (!this.get('body')) {//On r�cup�re le contenu de la note � l'aide du label "body" dans le formulaire
				this.set({body: "No Content"})
			};
		}
	});
	
	//Nom : NoteList------------------------------------------------------------------
	//Role : Classe qui h�rite de Backbone.Collection et la surchage
	//		 L'objet instanci� � partir de cette classe est une collection de notes
	var NoteList = Backbone.Collection.extend({ 
		// This collection is composed of Note objects    
		model: Note,
		
		// Set the localStorage datastore   
		localStorage: App.stores.notes,
		
		initialize: function(){  
			console.log('NoteList : initialize');
			var collection = this;	//On conserve le contexte (NoteList)	  
   
			this.localStorage.bind('update', function(){	//Quand on capte l'�v�nement 'update' qui apparait � la cr�ation d'une nouvelle note est cr��e
				collection.fetch();	//Mise � jour de la collection NoteList avec la nouvelle entr�e
				console.log('collection fetched');
		  });
		}
		
	});

	//Nom : NewNoteForm---------------------------------------------------------------
	//Role : Classe qui h�rite de Backbone.View et la surcharge
	//		 Cette classe d�fini les actions � accomplir lors de la cr�ation d'une nouvelle note
	//		 L'objet instanci� � partir de cette classe capte l'�v�nement de la cr�ation d'une note,
	//		 cr�e une nouvelle note et la sauvergarde
	var NewNoteForm = Backbone.View.extend({
		
		events: { //On souaite capter l'�v�nement "soumettre une note"
			"submit form" : "createNote"  	//Synthaxe particuli�re de Backbone : On lie l'�v�nement "submit" de l'�l�ment de l'arbre DOM "form" � la fonction "createNote"
		},

		createNote: function(event){ //La fonction createNote prend comme param�tre l'�v�nement qui l'a appel�e (submit en l'occurence)
			console.log('Create Note');
			
			var attrs = this.getAttributes(); //Les attributs de la note (Titre et Contenu) sont stock�s dans attrs
			var note = new Note();

			note.set(attrs); //Puis les attribus sont sauvegard�s dans une nouvelle note
			note.save();

			//Par d�faut le web browser soumet le formulaire, � l'aide de la commande suivante on sort de ce mode par d�faut
			event.preventDefault();

			//Stop le bublling de notre code
			event.stopPropagation();

			//Ferme la boite de dialogue
			$('.ui-dialog').dialog('close');
			
			//Vide les champs du formulaire
			this.reset();
		},
		
		//Fonction qui r�cup�re les attributs de la note
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
	//Role : Cette classe met � jour l'affichage des notes sur la page html
	//		 Quand la collection est modifi�e, les notes sont affich�es sur la page sans que l'utilisateur doive la rafraichir manuellement
	// 		 Represents a listview page displaying a collection of Notes
	// 		 Each item is represented by a NoteListItemView
	var NoteListView = Backbone.View.extend({
	
		initialize: function(){
			console.log('NoteListView : initialize');
			_.bindAll(this, 'addOne', 'addAll'); //._bindAll est une m�thode de underscore. On lie le contexte (NoteListView) avec les 
											   //�v�nements addOne et addAll (�v�nements d�finis plus bas)
		  
			this.collection.bind('add', this.addOne);  	//on lie l'�v�nement 'add' g�n�r� par backbone � la fonction 'addOne' 
			this.collection.bind('refresh', this.addAll);	//on lie l'�v�nement 'refresh' � la fonction 'addAll'
		  
			this.collection.fetch();
			console.log('NoteListView : initialize end');
		},
		
		//Le probl�me est que l'�v�nement n'est pas lanc�/capt�
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