<script setup lang="ts">

</script>

<template>
  <Card class="m-auto w-sm">
    <CardHeader>
      <CardTitle>ClutchCut</CardTitle>
      <CardDescription>Select video to find your clutch moments</CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        <div class="grid items-center w-full gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Clip name</Label>
            <Input id="name" placeholder="Enter name for output file" />  
          </div>
          <div class="flex flex-col mt-4 space-y-1.5">
            <Label for="video">Video file</Label>
            <Input id="video" type="file" accept="video/*" />
          </div>
        </div>
      </form>
    </CardContent>
    <CardFooter class="flex">
      <Button type="submit" class="ml-auto">Create Clip</Button>
    </CardFooter>
  </Card>
</template>
