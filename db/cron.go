package main

import (
	"fmt"
	"log"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"

	"github.com/robfig/cron/v3"
)

func main() {
	app := pocketbase.New()

	c := cron.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		DataCollection, err := CreateData(app)

		if err == nil {
			app.Save(DataCollection)
		}

		PublicCollection, err := CreatePublic(app, DataCollection)

		if err == nil {
			app.Save(PublicCollection)
		}

		RsvCollection, err := CreateRsv(app)

		if err == nil {
			app.Save(RsvCollection)
		}

		return se.Next()
	})

	c.AddFunc("@every 30s", func() {
		_, err := app.DB().
			NewQuery("DELETE FROM cryptdata WHERE expire < datetime('now');DELETE FROM reserved WHERE expire < datetime('now')").
			Execute()

		if err != nil {
			log.Println("Error running TTL cleanup:", time.Now().UTC().Format(time.RFC3339))
			log.Panic(err)
		}
	})

	go c.Start()

	defer c.Stop()

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func CreateCollection(app *pocketbase.PocketBase, name string) (*core.Collection, error) {
	_, err := app.FindCollectionByNameOrId(name)

	if err == nil {
		return nil, fmt.Errorf("collection already exists")
	}

	collection := core.NewBaseCollection(name)

	collection.ViewRule = types.Pointer("")
	collection.CreateRule = types.Pointer("")
	collection.ListRule = types.Pointer("")
	collection.DeleteRule = types.Pointer("")

	return collection, nil
}

func CreateRsv(app *pocketbase.PocketBase) (*core.Collection, error) {
	collection, err := CreateCollection(app, "reserved")

	if err != nil {
		return nil, err
	}

	collection.Fields.Add(&core.TextField{
		Name:     "url",
		Required: true,
	})

	collection.Fields.Add(&core.NumberField{
		Name:     "length",
		Required: true,
	})

	collection.Fields.Add(&core.TextField{
		Name:     "salt",
		Required: true,
	})

	collection.Fields.Add(&core.TextField{
		Name:     "iv",
		Required: true,
	})

	collection.Fields.Add(&core.DateField{
		Name:     "expire",
		Required: true,
	})

	return collection, nil
}

func CreateData(app *pocketbase.PocketBase) (*core.Collection, error) {
	collection, err := CreateCollection(app, "cryptdata")

	if err != nil {
		return nil, err
	}

	collection.Fields.Add(&core.TextField{
		Name:     "title",
		Required: true,
		Max:      200,
	})

	collection.Fields.Add(&core.TextField{
		Name:     "text",
		Required: true,
		Max:      150000,
	})

	collection.Fields.Add(&core.TextField{
		Name:     "format",
		Required: true,
		Max:      80,
	})

	collection.Fields.Add(&core.TextField{
		Name:     "hash",
		Required: true,
		Max:      0,
	})

	collection.Fields.Add(&core.TextField{
		Name:     "salt",
		Required: true,
	})

	collection.Fields.Add(&core.BoolField{
		Name:     "zk",
		Required: false,
	})

	collection.Fields.Add(&core.BoolField{
		Name:     "password",
		Required: false,
	})

	collection.Fields.Add(&core.BoolField{
		Name:     "burn",
		Required: false,
	})

	collection.Fields.Add(&core.DateField{
		Name:     "expire",
		Required: true,
	})

	collection.Fields.Add(&core.AutodateField{
		Name:     "created",
		OnCreate: true,
	})

	collection.Fields.Add(&core.AutodateField{
		Name:     "updated",
		OnCreate: true,
		OnUpdate: true,
	})

	return collection, nil
}

func CreatePublic(app *pocketbase.PocketBase, relation *core.Collection) (*core.Collection, error) {
	collection, err := CreateCollection(app, "public")

	if err != nil {
		return nil, err
	}

	collection.Fields.Add(&core.RelationField{
		Name:          "data_id",
		CollectionId:  relation.Id,
		CascadeDelete: true,
		Required:      true,
	})

	collection.Fields.Add(&core.TextField{
		Name:     "url",
		Required: true,
	})

	collection.Fields.Add(&core.NumberField{
		Name:     "views",
		Required: true,
	})

	collection.Fields.Add(&core.AutodateField{
		Name:     "created",
		OnCreate: true,
	})

	collection.Fields.Add(&core.JSONField{
		Name:     "tags",
		Required: false,
	})

	collection.Fields.Add(&core.AutodateField{
		Name:     "updated",
		OnCreate: true,
		OnUpdate: true,
	})

	return collection, nil
}

func CreateTags(app *pocketbase.PocketBase) (*core.Collection, error) {
	collection, err := CreateCollection(app, "tags")

	if err != nil {
		return nil, err
	}

	collection.Fields.Add(&core.TextField{
		Name:     "name",
		Required: true,
		Max:      80,
	})

	collection.Fields.Add(&core.RelationField{
		Name:          "texts",
		CollectionId:  "public",
		Required:      true,
		CascadeDelete: false,
	})

	collection.Fields.Add(&core.AutodateField{
		Name:     "created",
		OnCreate: true,
	})

	collection.Fields.Add(&core.AutodateField{
		Name:     "updated",
		OnCreate: true,
		OnUpdate: true,
	})

	return collection, nil
}
