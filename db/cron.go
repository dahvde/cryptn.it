package main

import (
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
		_, err := app.FindCollectionByNameOrId("cryptdata")

		if err == nil {
			return se.Next();
		}

		collection := core.NewBaseCollection("cryptdata");

		collection.ViewRule = types.Pointer("");
		collection.CreateRule = types.Pointer("")
		collection.ListRule = types.Pointer("")
		collection.DeleteRule = types.Pointer("")

		
		collection.Fields.Add(&core.TextField {
			Name:     "text",
			Required: true,
			Max:      140000,
		})

		collection.Fields.Add(&core.TextField {
			Name:     "hash",
			Required: true,
			Max:      0,
		})

		collection.Fields.Add(&core.BoolField{
			Name:     "password",
			Required: false,
		})

		collection.Fields.Add(&core.BoolField{
			Name:     "burn",
			Required: false,
		})

		collection.Fields.Add(&core.DateField {
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



		err = app.Save(collection)

		if err != nil {
			log.Panic(err)
		}

		return se.Next()
	});

    c.AddFunc("@every 1m", func() {
		res, err := app.DB().
		NewQuery("DELETE FROM cryptdata WHERE expire < datetime('now')").
		Execute();

		if err != nil {
			log.Println("Error running TTL cleanup:", time.Now().UTC().Format(time.RFC3339))
			log.Panic(err)
		}

        log.Println("Successfully ran TTL cleanup:", time.Now().UTC().Format(time.RFC3339))
		log.Println(res)
    })

    go c.Start()

    defer c.Stop()

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}
