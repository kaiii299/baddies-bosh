import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-5">
        <Card >
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <h2 className="text-4xl font-bold">100%</h2>
          </CardContent>
          <CardFooter className="flex justify-between">
          </CardFooter>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <h2 className="text-4xl font-bold">100%</h2>
          </CardContent>
          <CardFooter className="flex justify-between">
          </CardFooter>
        </Card>
        <Card >
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <h2 className="text-4xl font-bold">100%</h2>
          </CardContent>
          <CardFooter className="flex justify-between">
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
